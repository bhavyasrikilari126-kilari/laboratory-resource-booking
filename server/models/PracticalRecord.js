const mongoose = require('mongoose');

const practicalRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    experiment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experiment',
      required: [true, 'Experiment is required'],
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    observations: {
      type: String,
      trim: true,
    },
    results: {
      type: String,
      trim: true,
    },
    conclusion: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
    grade: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    feedback: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded'],
      default: 'pending',
    },
    attachments: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

practicalRecordSchema.index({ student: 1, experiment: 1 });
practicalRecordSchema.index({ status: 1 });

module.exports = mongoose.model('PracticalRecord', practicalRecordSchema);
