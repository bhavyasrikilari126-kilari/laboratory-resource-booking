import api from './api';

export const showcaseService = {
  getShowcases: (params) => api.get('/showcase', { params }),
  getShowcase: (id) => api.get(`/showcase/${id}`),
  createShowcase: (data) => api.post('/showcase', data),
  updateShowcase: (id, data) => api.put(`/showcase/${id}`, data),
  deleteShowcase: (id) => api.delete(`/showcase/${id}`),
  likeShowcase: (id) => api.post(`/showcase/${id}/like`),
  addFeedback: (id, data) => api.post(`/showcase/${id}/feedback`, data),
  getFeatured: () => api.get('/showcase/featured'),
};

export default showcaseService;
