import api from './api';

export const aiService = {
  recommendResources: (data) => api.post('/ai/recommend', data),
  smartSearch: (query) => api.get('/ai/search', { params: { query } }),
  estimateResources: (data) => api.post('/ai/estimate-resources', data),
};

export default aiService;
