import api from './api';

export const authApi = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  getFirebaseProfile: async (firebaseToken) => {
    const res = await api.get('/auth/firebase-profile', {
      headers: {
        Authorization: `Bearer ${firebaseToken}`
      }
    });
    return res.data;
  }
};
