const FacultyProfile = require('../models/FacultyProfile');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const getFacultyMentors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    const filter = { isMentoringAvailable: true };

    if (specialization) {
      filter.specializations = { $in: [new RegExp(specialization, 'i')] };
    }

    let profiles = await FacultyProfile.find(filter)
      .populate({
        path: 'user',
        select: 'name email department avatar phone',
        populate: { path: 'department', select: 'name code' },
      });

    // If no faculty profiles found in DB yet, query Users with role 'faculty'
    if (profiles.length === 0) {
      const facultyUsers = await User.find({ role: 'faculty' }).populate('department', 'name code');
      profiles = facultyUsers.map((u) => ({
        _id: u._id,
        user: u,
        specializations: u.skills || ['General Mentorship'],
        researchInterests: ['Academic Guidance'],
        isMentoringAvailable: true,
        officeHours: [{ day: 'Monday', startTime: '10:00', endTime: '12:00' }],
      }));
    }

    res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { facultyId, date, startTime, endTime, purpose, type } = req.body;

    // Check for double booking with faculty
    const conflict = await Appointment.findOne({
      faculty: facultyId,
      date: new Date(date),
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      return next(new AppError('Faculty already has an appointment booked at this time slot.', 409));
    }

    const appointment = await Appointment.create({
      student: req.user.id,
      faculty: facultyId,
      date: new Date(date),
      startTime,
      endTime: endTime || startTime,
      purpose,
      type: type || 'mentorship',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else if (req.user.role === 'faculty') {
      filter.faculty = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate('student', 'name email studentId')
      .populate('faculty', 'name email')
      .sort('-date -startTime');

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, feedback } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return next(new AppError('Appointment not found', 404));

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (feedback) appointment.feedback = feedback;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultyMentors,
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
};

