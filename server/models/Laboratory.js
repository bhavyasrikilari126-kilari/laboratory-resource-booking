const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Laboratory name is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    labNumber: {
      type: String,
      required: [true, 'Lab number is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    facilities: [{ type: String, trim: true }],
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    },
    facultyInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    photographs: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'occupied', 'under_maintenance'],
      default: 'available',
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

laboratorySchema.index({ department: 1, status: 1 });
laboratorySchema.index({ name: 'text', description: 'text' });

laboratorySchema.virtual('equipment', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'laboratory',
});

module.exports = mongoose.model('Laboratory', laboratorySchema);
