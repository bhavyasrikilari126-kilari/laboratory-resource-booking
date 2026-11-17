const mongoose = require('mongoose');

const officeHourSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  startTime: { type: String },
  endTime: { type: String },
});

const facultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specializations: [{ type: String, trim: true }],
    researchInterests: [{ type: String, trim: true }],
    qualifications: [{ type: String, trim: true }],
    officeHours: [officeHourSchema],
    maxMentees: {
      type: Number,
      default: 10,
    },
    currentMentees: {
      type: Number,
      default: 0,
    },
    isMentoringAvailable: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


facultyProfileSchema.virtual('availableSlots').get(function () {
  return Math.max(0, this.maxMentees - this.currentMentees);
});

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);
