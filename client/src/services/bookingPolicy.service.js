import api from './api';

export const bookingPolicyService = {
  getPolicies: (params) => api.get('/booking-policies', { params }),
  getPolicy: (id) => api.get(`/booking-policies/${id}`),
  createPolicy: (data) => api.post('/booking-policies', data),
  updatePolicy: (id, data) => api.put(`/booking-policies/${id}`, data),
  deletePolicy: (id) => api.delete(`/booking-policies/${id}`),
};

export default bookingPolicyService;

