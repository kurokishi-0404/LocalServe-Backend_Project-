import api from './api';

export const providerApi = {
  getProviders: async (params = {}) => {
    const res = await api.get('/providers', { params });
    return res.data;
  },

  getProviderById: async (id) => {
    const res = await api.get(`/providers/${id}`);
    return res.data;
  },

  updateProvider: async (id, data) => {
    const res = await api.put(`/providers/${id}`, data);
    return res.data;
  }
};
