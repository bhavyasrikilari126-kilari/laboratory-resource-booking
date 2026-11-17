const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    equipmentId: {
      type: String,
      required: [true, 'Equipment ID is required'],
      unique: true,
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
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
    },
    condition: {
      type: String,
      enum: ['good', 'fair', 'poor', 'damaged', 'under_maintenance'],
      default: 'good',
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isReservable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

equipmentSchema.index({ department: 1, category: 1 });
equipmentSchema.index({ laboratory: 1 });
equipmentSchema.index({ name: 'text', description: 'text', category: 'text' });

equipmentSchema.virtual('isAvailable').get(function () {
  return this.availableQuantity > 0 && this.isActive && this.condition !== 'damaged';
});

module.exports = mongoose.model('Equipment', equipmentSchema);
