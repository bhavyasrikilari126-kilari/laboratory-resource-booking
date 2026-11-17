const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: [true, 'Laboratory is required'],
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
    },
    type: {
      type: String,
      enum: ['individual', 'group'],
      default: 'individual',
    },
    groupMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    requiredEquipment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
      },
    ],
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'checked_in',
        'completed',
        'expired',
      ],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
    },
    digitalPass: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.index({ student: 1, date: 1, status: 1 });
bookingSchema.index({ laboratory: 1, date: 1, status: 1 });
bookingSchema.index({ status: 1, date: 1 });

bookingSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const [startH, startM] = this.startTime.split(':').map(Number);
    const [endH, endM] = this.endTime.split(':').map(Number);
    this.duration = (endH * 60 + endM) - (startH * 60 + startM);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
