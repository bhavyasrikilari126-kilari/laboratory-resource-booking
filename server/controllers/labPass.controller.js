const LabPass = require('../models/LabPass');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');

const getPassForBooking = async (req, res, next) => {
  try {
    const pass = await LabPass.findOne({ booking: req.params.bookingId })
      .populate('laboratory', 'name labNumber department')
      .populate('student', 'name studentId email');

    if (!pass) return next(new AppError('Lab pass not found for this booking', 404));

    res.status(200).json({
      success: true,
      data: pass,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPass = async (req, res, next) => {
  try {
    const { passCode, bookingRef } = req.body;
    let query = {};
    if (passCode) query.passCode = passCode;
    else if (bookingRef) {
      const b = await Booking.findOne({ bookingRef });
      if (b) query.booking = b._id;
    }

    const pass = await LabPass.findOne(query)
      .populate('laboratory', 'name labNumber')
      .populate('student', 'name studentId email avatar')
      .populate('booking');

    if (!pass) return next(new AppError('Invalid or expired lab pass', 404));

    const now = new Date();
    // Allow check-in within window or record entry
    if (!pass.isUsed) {
      pass.isUsed = true;
      pass.usedAt = now;
      pass.entryTime = now;
      pass.verifiedBy = req.user.id;
      await pass.save();

      // Update booking to checked_in
      await Booking.findByIdAndUpdate(pass.booking._id, {
        status: 'checked_in',
        checkInTime: now,
      });

      return res.status(200).json({
        success: true,
        message: 'Pass verified! Student checked in successfully.',
        action: 'check_in',
        data: pass,
      });
    } else if (!pass.exitTime) {
      pass.exitTime = now;
      await pass.save();

      // Update booking to completed
      await Booking.findByIdAndUpdate(pass.booking._id, {
        status: 'completed',
        checkOutTime: now,
      });

      return res.status(200).json({
        success: true,
        message: 'Student checked out successfully.',
        action: 'check_out',
        data: pass,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pass already fully utilized.',
      data: pass,
    });
  } catch (error) {
    next(error);
  }
};

const getMyPasses = async (req, res, next) => {
  try {
    const passes = await LabPass.find({ student: req.user.id })
      .populate('laboratory', 'name labNumber')
      .populate('booking', 'bookingRef purpose startTime endTime date status')
      .sort('-validFrom');

    res.status(200).json({
      success: true,
      data: passes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPassForBooking,
  verifyPass,
  getMyPasses,
};

