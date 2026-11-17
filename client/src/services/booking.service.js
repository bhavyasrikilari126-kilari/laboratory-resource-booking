import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  approveBooking: (id, data) => api.put(`/bookings/${id}/approve`, data),
  rejectBooking: (id, data) => api.put(`/bookings/${id}/reject`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  checkIn: (id) => api.put(`/bookings/${id}/check-in`),
  checkOut: (id) => api.put(`/bookings/${id}/check-out`),
  getMyBookings: (params) => api.get('/bookings/my/all', { params }),
  getMyUpcoming: () => api.get('/bookings/my/upcoming'),
};

export default bookingService;
