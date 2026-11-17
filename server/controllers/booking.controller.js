const Booking = require('../models/Booking');
const Laboratory = require('../models/Laboratory');
const Equipment = require('../models/Equipment');
const LabPass = require('../models/LabPass');
const BookingPolicy = require('../models/BookingPolicy');
const { AppError } = require('../middleware/errorHandler');
const { generateBookingRef, generatePassCode, calculateDuration } = require('../utils/helpers');
const { generateQRCode } = require('../utils/qrGenerator');
const notificationService = require('../services/notificationService');
const waitingListService = require('../services/waitingListService');

const createBooking = async (req, res, next) => {
  try {
    const {
      laboratory: labId,
      date,
      startTime,
      endTime,
      type,
      groupMembers,
      purpose,
      requiredEquipment,
    } = req.body;

    const studentId = req.user.id;
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const lab = await Laboratory.findById(labId);
    if (!lab || !lab.isActive) {
      return next(new AppError('Laboratory not found or unavailable', 404));
    }

    if (lab.status === 'under_maintenance') {
      return next(new AppError('Laboratory is currently under maintenance', 400));
    }

    // Check conflict: overlap with existing active booking
    const existingConflict = await Booking.findOne({
      laboratory: labId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['approved', 'checked_in', 'pending'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (existingConflict) {
      return next(new AppError('Selected time slot conflicts with an existing reservation.', 409));
    }

    const duration = calculateDuration(startTime, endTime);
    const bookingRef = generateBookingRef();

    // Check policy if any
    const policy = await BookingPolicy.findOne({
      isActive: true,
      $or: [{ laboratory: labId }, { department: lab.department }],
    });

    const requiresApproval = policy ? policy.requiresFacultyApproval : true;
    const initialStatus = requiresApproval ? 'pending' : 'approved';

    const booking = await Booking.create({
      bookingRef,
      student: studentId,
      laboratory: labId,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      type: type || 'individual',
      groupMembers: groupMembers || [],
      purpose,
      requiredEquipment: requiredEquipment || [],
      status: initialStatus,
    });

    // If auto-approved, generate digital pass right away
    if (initialStatus === 'approved') {
      const passCode = generatePassCode();
      const validFrom = new Date(bookingDate);
      const [startH, startM] = startTime.split(':').map(Number);
      validFrom.setHours(startH, startM, 0, 0);

      const validUntil = new Date(bookingDate);
      const [endH, endM] = endTime.split(':').map(Number);
      validUntil.setHours(endH, endM, 0, 0);

      const qrPayload = {
        bookingRef,
        passCode,
        studentId,
        labNumber: lab.labNumber,
        validFrom,
        validUntil,
      };

      const qrCodeData = await generateQRCode(qrPayload);

      const labPass = await LabPass.create({
        booking: booking._id,
        student: studentId,
        laboratory: labId,
        passCode,
        qrCodeData,
        validFrom,
        validUntil,
      });

      booking.digitalPass = labPass._id;
      booking.qrCode = qrCodeData;
      await booking.save();
    }

    // Send notification
    await notificationService.bookingCreated(studentId, bookingRef, lab.name);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { status, laboratory, department, date, student } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (laboratory) filter.laboratory = laboratory;
    if (student) filter.student = student;

    if (date) {
      const d = new Date(date);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    // If user is faculty, show bookings for their department's labs or pending approvals
    if (req.user.role === 'faculty') {
      // Find faculty's labs
      const facultyLabs = await Laboratory.find({ facultyInCharge: req.user.id }).select('_id');
      const labIds = facultyLabs.map((l) => l._id);
      if (labIds.length > 0) {
        filter.laboratory = { $in: labIds };
      }
    }

    const bookings = await Booking.find(filter)
      .populate('student', 'name email studentId')
      .populate('laboratory', 'name labNumber department')
      .populate('requiredEquipment', 'name equipmentId')
      .populate('approvedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name email studentId phone')
      .populate('laboratory', 'name labNumber department capacity facilities')
      .populate('groupMembers', 'name email studentId')
      .populate('requiredEquipment', 'name equipmentId category availableQuantity')
      .populate('approvedBy', 'name email')
      .populate('digitalPass');

    if (!booking) return next(new AppError('Booking not found', 404));

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('laboratory student');
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.status !== 'pending') {
      return next(new AppError(`Cannot approve booking in '${booking.status}' status`, 400));
    }

    booking.status = 'approved';
    booking.approvedBy = req.user.id;

    // Generate digital lab pass
    const passCode = generatePassCode();
    const validFrom = new Date(booking.date);
    const [startH, startM] = booking.startTime.split(':').map(Number);
    validFrom.setHours(startH, startM, 0, 0);

    const validUntil = new Date(booking.date);
    const [endH, endM] = booking.endTime.split(':').map(Number);
    validUntil.setHours(endH, endM, 0, 0);

    const qrPayload = {
      bookingRef: booking.bookingRef,
      passCode,
      studentId: booking.student._id,
      labNumber: booking.laboratory.labNumber,
      validFrom,
      validUntil,
    };

    const qrCodeData = await generateQRCode(qrPayload);

    const labPass = await LabPass.create({
      booking: booking._id,
      student: booking.student._id,
      laboratory: booking.laboratory._id,
      passCode,
      qrCodeData,
      validFrom,
      validUntil,
    });

    booking.digitalPass = labPass._id;
    booking.qrCode = qrCodeData;
    await booking.save();

    await notificationService.bookingApproved(
      booking.student._id,
      booking.bookingRef,
      booking.laboratory.name
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('laboratory student');
    if (!booking) return next(new AppError('Booking not found', 404));

    booking.status = 'rejected';
    booking.rejectionReason = reason || 'Reservation rejected by faculty';
    await booking.save();

    await notificationService.bookingRejected(
      booking.student._id,
      booking.bookingRef,
      booking.laboratory.name,
      booking.rejectionReason
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('laboratory');
    if (!booking) return next(new AppError('Booking not found', 404));

    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return next(new AppError(`Cannot cancel a booking that is ${booking.status}`, 400));
    }

    booking.status = 'cancelled';
    await booking.save();

    // Check waiting list for this lab slot and notify next in line
    try {
      await waitingListService.processWaitingList(
        'lab',
        booking.laboratory._id,
        booking.date,
        booking.startTime,
        booking.endTime
      );
    } catch (wlError) {
      console.error('Error processing waiting list after cancellation:', wlError);
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    booking.status = 'checked_in';
    booking.checkInTime = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    booking.status = 'completed';
    booking.checkOutTime = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { student: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('laboratory', 'name labNumber department')
      .populate('requiredEquipment', 'name')
      .populate('digitalPass')
      .sort('-date -startTime');

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getMyUpcoming = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = await Booking.find({
      student: req.user.id,
      date: { $gte: today },
      status: { $in: ['approved', 'pending'] },
    })
      .populate('laboratory', 'name labNumber department')
      .populate('digitalPass')
      .sort('date startTime')
      .limit(5);

    res.status(200).json({
      success: true,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  checkIn,
  checkOut,
  getMyBookings,
  getMyUpcoming,
};

