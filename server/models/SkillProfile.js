const mongoose = require('mongoose');

const skillProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    technicalSkills: [
      {
        name: { type: String, required: true, trim: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'beginner',
        },
      },
    ],
    programmingLanguages: [{ type: String, trim: true }],
    projectInterests: [{ type: String, trim: true }],
    preferredDomains: [{ type: String, trim: true }],
    completedExperiments: {
      type: Number,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
    },
    labSessionsAttended: {
      type: Number,
      default: 0,
    },
    equipmentExperience: [
      {
        equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        hoursUsed: { type: Number, default: 0 },
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isVerified: { type: Boolean, default: false },
        date: { type: Date, default: Date.now },
      },
    ],
    isPublic: {
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

skillProfileSchema.index({ 'technicalSkills.name': 1 });
skillProfileSchema.index({ programmingLanguages: 1 });

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
