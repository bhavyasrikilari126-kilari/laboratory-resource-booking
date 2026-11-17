import api from './api';

export const learningMaterialService = {
  getMaterials: (params) => api.get('/learning-materials', { params }),
  getMaterial: (id) => api.get(`/learning-materials/${id}`),
  createMaterial: (data) => api.post('/learning-materials', data),
  updateMaterial: (id, data) => api.put(`/learning-materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/learning-materials/${id}`),
};

export default learningMaterialService;
