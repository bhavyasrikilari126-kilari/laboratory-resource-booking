const mongoose = require('mongoose');

const equipmentReservationSchema = new mongoose.Schema(
  {
    reservationRef: {
      type: String,
      unique: true,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'issued', 'returned', 'overdue'],
      default: 'pending',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    issuedAt: {
      type: Date,
    },
    returnedAt: {
      type: Date,
    },
    returnCondition: {
      type: String,
      enum: ['good', 'fair', 'poor', 'damaged'],
    },
    returnVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

equipmentReservationSchema.index({ student: 1, status: 1 });
equipmentReservationSchema.index({ equipment: 1, status: 1 });
equipmentReservationSchema.index({ reservationRef: 1 });

module.exports = mongoose.model('EquipmentReservation', equipmentReservationSchema);
