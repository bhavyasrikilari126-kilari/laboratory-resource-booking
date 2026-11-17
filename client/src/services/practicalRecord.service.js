import api from './api';

export const practicalRecordService = {
  submit: (data) => api.post('/practical-records', data),
  getMyRecords: (params) => api.get('/practical-records/my', { params }),
  grade: (id, data) => api.put(`/practical-records/${id}/grade`, data),
  getRecords: (params) => api.get('/practical-records', { params }),
};

export default practicalRecordService;
