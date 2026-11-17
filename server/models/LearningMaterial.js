const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['manual', 'reference', 'checklist', 'guide'],
      required: [true, 'Type is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    fileUrl: {
      type: String,
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{ type: String, trim: true }],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

learningMaterialSchema.index({ department: 1, course: 1 });
learningMaterialSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('LearningMaterial', learningMaterialSchema);
