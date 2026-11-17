const { v4: uuidv4 } = require('uuid');

const generateBookingRef = () => {
  const prefix = 'BK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateReservationRef = () => {
  const prefix = 'ER';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generatePassCode = () => {
  const prefix = 'LP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const calculateDuration = (startTime, endTime) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
};

const paginate = (query, page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  return {
    query: query.skip(skip).limit(limitNum),
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

const buildPaginationResponse = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

module.exports = {
  generateBookingRef,
  generateReservationRef,
  generatePassCode,
  formatDate,
  calculateDuration,
  paginate,
  buildPaginationResponse,
};
