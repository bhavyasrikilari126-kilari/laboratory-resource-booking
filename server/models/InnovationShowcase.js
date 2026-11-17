const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const innovationShowcaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    images: [{ type: String }],
    tags: [{ type: String, trim: true }],
    category: {
      type: String,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    feedback: [feedbackSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

innovationShowcaseSchema.index({ isPublished: 1, isFeatured: 1, createdAt: -1 });
innovationShowcaseSchema.index({ createdBy: 1 });
innovationShowcaseSchema.index({ title: 'text', description: 'text', tags: 'text' });

innovationShowcaseSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

module.exports = mongoose.model('InnovationShowcase', innovationShowcaseSchema);
