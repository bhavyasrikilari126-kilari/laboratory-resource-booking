import api from './api';

export const auditLogService = {
  getLogs: (params) => api.get('/audit-logs', { params }),
};

export default auditLogService;

