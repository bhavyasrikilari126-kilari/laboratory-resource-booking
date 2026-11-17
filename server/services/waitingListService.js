const WaitingList = require('../models/WaitingList');
const Booking = require('../models/Booking');
const notificationService = require('./notificationService');

const processWaitingList = async (type, resourceId, date, startTime, endTime) => {
  try {
    const filter = {
      type,
      preferredDate: date,
      status: 'waiting',
    };

    if (type === 'lab') {
      filter.laboratory = resourceId;
    } else {
      filter.equipment = resourceId;
    }

    if (startTime && endTime) {
      filter.preferredStartTime = { $lte: endTime };
      filter.preferredEndTime = { $gte: startTime };
    }

    const nextInLine = await WaitingList.findOne(filter)
      .sort({ position: 1, createdAt: 1 })
      .populate('student', 'name email')
      .populate('laboratory', 'name')
      .populate('equipment', 'name');

    if (!nextInLine) {
      return null;
    }

    nextInLine.status = 'offered';
    nextInLine.offerExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    nextInLine.notifiedAt = new Date();
    await nextInLine.save();

    const resourceName =
      type === 'lab'
        ? nextInLine.laboratory?.name || 'Laboratory'
        : nextInLine.equipment?.name || 'Equipment';

    await notificationService.waitingListOffer(
      nextInLine.student._id,
      type,
      resourceName,
      nextInLine.offerExpiresAt
    );

    return nextInLine;
  } catch (error) {
    console.error('Error processing waiting list:', error);
    return null;
  }
};

const expireOffers = async () => {
  try {
    const expiredOffers = await WaitingList.find({
      status: 'offered',
      offerExpiresAt: { $lt: new Date() },
    }).populate('student', 'name email');

    for (const offer of expiredOffers) {
      offer.status = 'expired';
      await offer.save();

      const resourceName = offer.type === 'lab' ? 'laboratory' : 'equipment';
      await notificationService.waitingListExpired(
        offer.student._id,
        resourceName
      );

      const resourceId = offer.type === 'lab' ? offer.laboratory : offer.equipment;
      await processWaitingList(
        offer.type,
        resourceId,
        offer.preferredDate,
        offer.preferredStartTime,
        offer.preferredEndTime
      );
    }

    return expiredOffers.length;
  } catch (error) {
    console.error('Error expiring offers:', error);
    return 0;
  }
};

const getPosition = async (type, resourceId, date) => {
  const filter = {
    type,
    preferredDate: date,
    status: 'waiting',
  };

  if (type === 'lab') {
    filter.laboratory = resourceId;
  } else {
    filter.equipment = resourceId;
  }

  const count = await WaitingList.countDocuments(filter);
  return count + 1;
};

module.exports = {
  processWaitingList,
  expireOffers,
  getPosition,
};
