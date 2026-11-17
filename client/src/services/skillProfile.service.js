import api from './api';

export const skillProfileService = {
  getMyProfile: () => api.get('/skill-profiles/my'),
  updateProfile: (data) => api.put('/skill-profiles/my', data),
  searchStudents: (params) => api.get('/skill-profiles/search', { params }),
};

export default skillProfileService;
