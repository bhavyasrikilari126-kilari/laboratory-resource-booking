const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team leader is required'],
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    maxMembers: {
      type: Number,
      default: 5,
      min: [2, 'Team must have at least 2 members'],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
    requiredSkills: [{ type: String, trim: true }],
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teamSchema.index({ leader: 1 });
teamSchema.index({ department: 1, isOpen: 1 });

teamSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

teamSchema.virtual('isFull').get(function () {
  return this.members ? this.members.length >= this.maxMembers : false;
});

module.exports = mongoose.model('Team', teamSchema);
