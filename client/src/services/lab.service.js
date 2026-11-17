import api from './api';

export const labService = {
  getLabs: (params) => api.get('/labs', { params }),
  getLab: (id) => api.get(`/labs/${id}`),
  getLabAvailability: (id, params) => api.get(`/labs/${id}/availability`, { params }),
  createLab: (data) => api.post('/labs', data),
  updateLab: (id, data) => api.put(`/labs/${id}`, data),
  deleteLab: (id) => api.delete(`/labs/${id}`),
};

export default labService;
