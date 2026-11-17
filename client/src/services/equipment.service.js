import api from './api';

export const equipmentService = {
  getEquipment: (params) => api.get('/equipment', { params }),
  getEquipmentItem: (id) => api.get(`/equipment/${id}`),
  reserveEquipment: (id, data) => api.post(`/equipment/${id}/reserve`, data),
  issueEquipment: (id, data) => api.put(`/equipment/${id}/issue`, data),
  returnEquipment: (id, data) => api.put(`/equipment/${id}/return`, data),
  createEquipment: (data) => api.post('/equipment', data),
  updateEquipment: (id, data) => api.put(`/equipment/${id}`, data),
};

export default equipmentService;
