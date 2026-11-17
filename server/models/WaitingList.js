const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    type: {
      type: String,
      enum: ['lab', 'equipment'],
      required: [true, 'Type is required'],
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    preferredStartTime: {
      type: String,
      required: [true, 'Preferred start time is required'],
    },
    preferredEndTime: {
      type: String,
      required: [true, 'Preferred end time is required'],
    },
    position: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['waiting', 'offered', 'accepted', 'expired', 'cancelled'],
      default: 'waiting',
    },
    offerExpiresAt: {
      type: Date,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

waitingListSchema.index({ laboratory: 1, preferredDate: 1, status: 1 });
waitingListSchema.index({ equipment: 1, status: 1 });
waitingListSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('WaitingList', waitingListSchema);
