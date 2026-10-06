import api from './api';

export const chatApi = {
  getChats: async () => {
    const res = await api.get('/chats');
    return res.data;
  },

  getChatById: async (id) => {
    const res = await api.get(`/chats/${id}`);
    return res.data;
  },

  sendMessage: async (data) => {
    const res = await api.post('/chats', data);
    return res.data;
  }
};
