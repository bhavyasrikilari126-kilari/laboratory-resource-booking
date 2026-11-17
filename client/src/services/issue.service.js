import api from './api';

export const issueService = {
  report: (data) => api.post('/issues', data),
  getIssues: (params) => api.get('/issues', { params }),
  getIssue: (id) => api.get(`/issues/${id}`),
  assign: (id, data) => api.put(`/issues/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/issues/${id}/status`, data),
  resolve: (id, data) => api.put(`/issues/${id}/resolve`, data),
};

export default issueService;
