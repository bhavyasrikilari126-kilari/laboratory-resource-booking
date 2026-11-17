const Laboratory = require('../models/Laboratory');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const { AppError } = require('../middleware/errorHandler');

const getLabs = async (req, res, next) => {
  try {
    const { department, search, status, capacity } = req.query;
    const filter = { isActive: true };

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { labNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { facilities: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const labs = await Laboratory.find(filter)
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email')
      .sort('labNumber');

    res.status(200).json({
      success: true,
      data: labs,
    });
  } catch (error) {
    next(error);
  }
};

const getLab = async (req, res, next) => {
  try {
    const lab = await Laboratory.findById(req.params.id)
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email');

    if (!lab) return next(new AppError('Laboratory not found', 404));

    // Also get equipment in this lab
    const equipment = await Equipment.find({ laboratory: lab._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        ...lab.toObject(),
        equipment,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLabAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const lab = await Laboratory.findById(id);
    if (!lab) return next(new AppError('Laboratory not found', 404));

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find confirmed or pending bookings on this date
    const bookings = await Booking.find({
      laboratory: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['approved', 'checked_in', 'pending'] },
    }).select('startTime endTime status purpose student').populate('student', 'name');

    // Standard time slots: 09:00 - 17:00
    const timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '12:00', end: '13:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
    ];

    const slots = timeSlots.map((slot) => {
      const conflictingBooking = bookings.find((b) => {
        // check overlap
        return slot.start < b.endTime && slot.end > b.startTime;
      });

      return {
        ...slot,
        isAvailable: !conflictingBooking && lab.status === 'available',
        booking: conflictingBooking || null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        laboratory: lab,
        date: targetDate.toISOString().split('T')[0],
        slots,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createLab = async (req, res, next) => {
  try {
    const lab = await Laboratory.create(req.body);
    res.status(201).json({
      success: true,
      data: lab,
    });
  } catch (error) {
    next(error);
  }
};

const updateLab = async (req, res, next) => {
  try {
    const lab = await Laboratory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lab) return next(new AppError('Laboratory not found', 404));

    res.status(200).json({
      success: true,
      data: lab,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLab = async (req, res, next) => {
  try {
    const lab = await Laboratory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!lab) return next(new AppError('Laboratory not found', 404));

    res.status(200).json({
      success: true,
      message: 'Laboratory deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabs,
  getLab,
  getLabAvailability,
  createLab,
  updateLab,
  deleteLab,
};

