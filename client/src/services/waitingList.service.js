import api from './api';

export const waitingListService = {
  join: (data) => api.post('/waiting-list', data),
  getMyWaitingList: (params) => api.get('/waiting-list/my', { params }),
  leave: (id) => api.delete(`/waiting-list/${id}`),
  accept: (id) => api.put(`/waiting-list/${id}/accept`),
};

export default waitingListService;
