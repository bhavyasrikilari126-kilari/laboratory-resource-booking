const mongoose = require('mongoose');

const bookingPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
    },
    maxDurationMinutes: {
      type: Number,
      default: 180,
      min: [30, 'Minimum duration is 30 minutes'],
    },
    maxBookingsPerDay: {
      type: Number,
      default: 2,
      min: 1,
    },
    maxBookingsPerMonth: {
      type: Number,
      default: 20,
      min: 1,
    },
    advanceBookingDays: {
      type: Number,
      default: 14,
      min: 1,
    },
    cancellationDeadlineHours: {
      type: Number,
      default: 2,
      min: 0,
    },
    requiresFacultyApproval: {
      type: Boolean,
      default: true,
    },
    allowedRoles: [
      {
        type: String,
        enum: ['student', 'faculty', 'technician', 'admin'],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingPolicySchema.index({ laboratory: 1, isActive: 1 });
bookingPolicySchema.index({ department: 1, isActive: 1 });

module.exports = mongoose.model('BookingPolicy', bookingPolicySchema);
