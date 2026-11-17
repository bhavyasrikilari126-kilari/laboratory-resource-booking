const WaitingList = require('../models/WaitingList');
const Booking = require('../models/Booking');
const Laboratory = require('../models/Laboratory');
const { AppError } = require('../middleware/errorHandler');
const { generateBookingRef, calculateDuration, generatePassCode } = require('../utils/helpers');
const { generateQRCode } = require('../utils/qrGenerator');
const LabPass = require('../models/LabPass');

const join = async (req, res, next) => {
  try {
    const { laboratory, equipment, type = 'lab', preferredDate, preferredStartTime, preferredEndTime } = req.body;

    const count = await WaitingList.countDocuments({
      laboratory: laboratory || undefined,
      equipment: equipment || undefined,
      preferredDate: new Date(preferredDate),
      status: 'waiting',
    });

    const entry = await WaitingList.create({
      student: req.user.id,
      laboratory,
      equipment,
      type,
      preferredDate: new Date(preferredDate),
      preferredStartTime,
      preferredEndTime,
      position: count + 1,
      status: 'waiting',
    });

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

const getMyWaitingList = async (req, res, next) => {
  try {
    const entries = await WaitingList.find({ student: req.user.id })
      .populate('laboratory', 'name labNumber department')
      .populate('equipment', 'name category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

const leave = async (req, res, next) => {
  try {
    const entry = await WaitingList.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!entry) return next(new AppError('Waiting list entry not found', 404));

    res.status(200).json({
      success: true,
      message: 'Successfully removed from waiting list',
    });
  } catch (error) {
    next(error);
  }
};

const accept = async (req, res, next) => {
  try {
    const entry = await WaitingList.findOne({
      _id: req.params.id,
      student: req.user.id,
      status: 'offered',
    }).populate('laboratory');

    if (!entry) {
      return next(new AppError('No active slot offer found or offer has expired', 400));
    }

    if (entry.offerExpiresAt && new Date() > new Date(entry.offerExpiresAt)) {
      entry.status = 'expired';
      await entry.save();
      return next(new AppError('This offer has expired.', 400));
    }

    entry.status = 'accepted';
    await entry.save();

    // Create confirmed booking for student
    const bookingRef = generateBookingRef();
    const duration = calculateDuration(entry.preferredStartTime, entry.preferredEndTime);

    const booking = await Booking.create({
      bookingRef,
      student: req.user.id,
      laboratory: entry.laboratory._id,
      date: entry.preferredDate,
      startTime: entry.preferredStartTime,
      endTime: entry.preferredEndTime,
      duration,
      purpose: 'Waiting List Slot Confirmation',
      status: 'approved',
    });

    // Generate digital pass
    const passCode = generatePassCode();
    const validFrom = new Date(entry.preferredDate);
    const [startH, startM] = entry.preferredStartTime.split(':').map(Number);
    validFrom.setHours(startH, startM, 0, 0);

    const validUntil = new Date(entry.preferredDate);
    const [endH, endM] = entry.preferredEndTime.split(':').map(Number);
    validUntil.setHours(endH, endM, 0, 0);

    const qrPayload = {
      bookingRef,
      passCode,
      studentId: req.user.id,
      labNumber: entry.laboratory.labNumber,
      validFrom,
      validUntil,
    };

    const qrCodeData = await generateQRCode(qrPayload);

    const labPass = await LabPass.create({
      booking: booking._id,
      student: req.user.id,
      laboratory: entry.laboratory._id,
      passCode,
      qrCodeData,
      validFrom,
      validUntil,
    });

    booking.digitalPass = labPass._id;
    booking.qrCode = qrCodeData;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Slot accepted and booking confirmed!',
      data: {
        entry,
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  join,
  getMyWaitingList,
  leave,
  accept,
};

