import api from './api';

export const notificationApi = {
  sendNotification: async (payload) => {
    const res = await api.post('/notifications/send', payload);
    return res.data;
  }
};
