const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_approved',
        'booking_rejected',
        'booking_cancelled',
        'booking_reminder',
        'checkin_reminder',
        'equipment_reserved',
        'equipment_issued',
        'equipment_returned',
        'equipment_overdue',
        'waiting_list_offer',
        'waiting_list_expired',
        'project_update',
        'team_invitation',
        'team_request',
        'appointment_created',
        'appointment_confirmed',
        'appointment_cancelled',
        'issue_assigned',
        'issue_resolved',
        'announcement',
        'system',
        'general',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
