import api from './api';

export const adminApi = {
  getProviders: async () => {
    const res = await api.get('/admin/providers');
    return res.data;
  },

  verifyProvider: async (id, isVerified = true) => {
    const res = await api.put(`/admin/verify/${id}`, { isVerified });
    return res.data;
  },

  getDisputes: async () => {
    const res = await api.get('/admin/disputes');
    return res.data;
  },

  resolveDispute: async (id, data) => {
    const res = await api.put(`/admin/disputes/${id}`, data);
    return res.data;
  },

  createDispute: async (data) => {
    const res = await api.post('/admin/disputes', data);
    return res.data;
  }
};
