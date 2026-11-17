import api from './api';

export const teamService = {
  getTeams: (params) => api.get('/teams', { params }),
  getTeam: (id) => api.get(`/teams/${id}`),
  createTeam: (data) => api.post('/teams', data),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
  inviteMember: (id, data) => api.post(`/teams/${id}/invite`, data),
  respondToInvitation: (id, data) => api.put(`/teams/${id}/respond`, data),
  findTeams: (params) => api.get('/teams/find', { params }),
};

export default teamService;
