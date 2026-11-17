import api from './api';

export const labPassService = {
  getPassForBooking: (bookingId) => api.get(`/lab-passes/booking/${bookingId}`),
  verifyPass: (data) => api.post('/lab-passes/verify', data),
  getMyPasses: (params) => api.get('/lab-passes/my', { params }),
};

export default labPassService;
