const mongoose = require('mongoose');

const vivaQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const experimentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Experiment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    course: {
      type: String,
      trim: true,
    },
    objectives: [{ type: String }],
    procedure: [{ type: String }],
    materials: [{ type: String }],
    safetyGuidelines: [{ type: String }],
    vivaQuestions: [vivaQuestionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachments: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    estimatedDuration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

experimentSchema.index({ department: 1, course: 1 });
experimentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Experiment', experimentSchema);
