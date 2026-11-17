import api from './api';

export const analyticsService = {
  getLabUtilization: (params) => api.get('/analytics/lab-utilization', { params }),
  getEquipmentUsage: (params) => api.get('/analytics/equipment-usage', { params }),
  getBookingTrends: (params) => api.get('/analytics/booking-trends', { params }),
  getDepartmentStats: (params) => api.get('/analytics/department-stats', { params }),
  getOverview: (params) => api.get('/analytics/overview', { params }),
};

export default analyticsService;
