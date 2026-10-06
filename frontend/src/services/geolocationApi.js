import api from './api';

export const geolocationApi = {
  getNearbyServices: async (lat, lng, radius = 10, category = '') => {
    const res = await api.get('/geolocation/nearby', {
      params: { lat, lng, radius, ...(category ? { category } : {}) }
    });
    return res.data;
  },

  searchServices: async ({ location, service, category } = {}) => {
    const res = await api.get('/geolocation/search', {
      params: {
        ...(location ? { location } : {}),
        ...(service ? { service } : {}),
        ...(category ? { category } : {})
      }
    });
    return res.data;
  }
};
