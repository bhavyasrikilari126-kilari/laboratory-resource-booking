import api from './api';

export const projectService = {
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`),
  addMilestone: (id, data) => api.post(`/projects/${id}/milestones`, data),
  updateMilestone: (id, milestoneId, data) => api.put(`/projects/${id}/milestones/${milestoneId}`, data),
  deleteMilestone: (id, milestoneId) => api.delete(`/projects/${id}/milestones/${milestoneId}`),
  addTask: (id, data) => api.post(`/projects/${id}/tasks`, data),
  updateTask: (id, taskId, data) => api.put(`/projects/${id}/tasks/${taskId}`, data),
  deleteTask: (id, taskId) => api.delete(`/projects/${id}/tasks/${taskId}`),
  addDocument: (id, data) => api.post(`/projects/${id}/documents`, data),
  deleteDocument: (id, docId) => api.delete(`/projects/${id}/documents/${docId}`),
};

export default projectService;
