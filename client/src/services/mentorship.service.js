import api from './api';

export const mentorshipService = {
  getFacultyMentors: (params) => api.get('/mentorship/mentors', { params }),
  createAppointment: (data) => api.post('/mentorship/appointments', data),
  getMyAppointments: (params) => api.get('/mentorship/appointments/my', { params }),
  updateAppointmentStatus: (id, data) => api.put(`/mentorship/appointments/${id}/status`, data),
};

export default mentorshipService;
