import api from './api';

export const experimentService = {
  getExperiments: (params) => api.get('/experiments', { params }),
  getExperiment: (id) => api.get(`/experiments/${id}`),
  createExperiment: (data) => api.post('/experiments', data),
  updateExperiment: (id, data) => api.put(`/experiments/${id}`, data),
  deleteExperiment: (id) => api.delete(`/experiments/${id}`),
};

export default experimentService;
