const mongoose = require('mongoose');

const labPassSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
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
    passCode: {
      type: String,
      unique: true,
      required: true,
    },
    qrCodeData: {
      type: String,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    entryTime: {
      type: Date,
    },
    exitTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

labPassSchema.index({ passCode: 1 });
labPassSchema.index({ booking: 1 });
labPassSchema.index({ student: 1 });

module.exports = mongoose.model('LabPass', labPassSchema);
