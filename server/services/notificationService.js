const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

const createNotification = async (recipientId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });

    sendRealTimeNotification(recipientId, notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const sendRealTimeNotification = (recipientId, notification) => {
  try {
    emitToUser(recipientId.toString(), 'notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      createdAt: notification.createdAt,
    });
  } catch (error) {
    console.error('Error sending real-time notification:', error);
  }
};

const bookingCreated = async (studentId, bookingRef, labName) => {
  return createNotification(
    studentId,
    'booking_created',
    'Booking Created',
    `Your booking ${bookingRef} for ${labName} has been created and is pending approval.`,
    { bookingRef }
  );
};

const bookingApproved = async (studentId, bookingRef, labName) => {
  return createNotification(
    studentId,
    'booking_approved',
    'Booking Approved',
    `Your booking ${bookingRef} for ${labName} has been approved. Your lab pass is now available.`,
    { bookingRef }
  );
};

const bookingRejected = async (studentId, bookingRef, labName, reason) => {
  return createNotification(
    studentId,
    'booking_rejected',
    'Booking Rejected',
    `Your booking ${bookingRef} for ${labName} has been rejected. Reason: ${reason}`,
    { bookingRef, reason }
  );
};

const bookingCancelled = async (studentId, bookingRef, labName) => {
  return createNotification(
    studentId,
    'booking_cancelled',
    'Booking Cancelled',
    `Your booking ${bookingRef} for ${labName} has been cancelled.`,
    { bookingRef }
  );
};

const waitingListOffer = async (studentId, type, resourceName, expiresAt) => {
  return createNotification(
    studentId,
    'waiting_list_offer',
    'Slot Available',
    `A slot for ${resourceName} is now available. Accept within 30 minutes before it expires.`,
    { type, resourceName, expiresAt }
  );
};

const waitingListExpired = async (studentId, resourceName) => {
  return createNotification(
    studentId,
    'waiting_list_expired',
    'Offer Expired',
    `Your waiting list offer for ${resourceName} has expired.`,
    { resourceName }
  );
};

const equipmentReserved = async (studentId, equipmentName) => {
  return createNotification(
    studentId,
    'equipment_reserved',
    'Equipment Reserved',
    `Your reservation for ${equipmentName} has been created.`,
    { equipmentName }
  );
};

const equipmentIssued = async (studentId, equipmentName) => {
  return createNotification(
    studentId,
    'equipment_issued',
    'Equipment Issued',
    `${equipmentName} has been issued to you. Please handle with care.`,
    { equipmentName }
  );
};

const equipmentReturned = async (studentId, equipmentName) => {
  return createNotification(
    studentId,
    'equipment_returned',
    'Equipment Returned',
    `${equipmentName} has been returned and verified.`,
    { equipmentName }
  );
};

const issueAssigned = async (technicianId, issueTitle) => {
  return createNotification(
    technicianId,
    'issue_assigned',
    'Issue Assigned',
    `Issue "${issueTitle}" has been assigned to you.`,
    { issueTitle }
  );
};

const issueResolved = async (reporterId, issueTitle) => {
  return createNotification(
    reporterId,
    'issue_resolved',
    'Issue Resolved',
    `Issue "${issueTitle}" has been resolved.`,
    { issueTitle }
  );
};

const teamInvitation = async (userId, teamName, fromUserName) => {
  return createNotification(
    userId,
    'team_invitation',
    'Team Invitation',
    `${fromUserName} has invited you to join team "${teamName}".`,
    { teamName }
  );
};

const appointmentCreated = async (facultyId, studentName, date) => {
  return createNotification(
    facultyId,
    'appointment_created',
    'New Appointment Request',
    `${studentName} has requested an appointment on ${date}.`,
    { studentName, date }
  );
};

const appointmentConfirmed = async (studentId, facultyName, date) => {
  return createNotification(
    studentId,
    'appointment_confirmed',
    'Appointment Confirmed',
    `Your appointment with ${facultyName} on ${date} has been confirmed.`,
    { facultyName, date }
  );
};

module.exports = {
  createNotification,
  sendRealTimeNotification,
  bookingCreated,
  bookingApproved,
  bookingRejected,
  bookingCancelled,
  waitingListOffer,
  waitingListExpired,
  equipmentReserved,
  equipmentIssued,
  equipmentReturned,
  issueAssigned,
  issueResolved,
  teamInvitation,
  appointmentCreated,
  appointmentConfirmed,
};
