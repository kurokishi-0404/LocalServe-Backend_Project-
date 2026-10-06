import api from './api';

export const reviewApi = {
  createReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },

  getServiceReviews: async (serviceId) => {
    const res = await api.get(`/reviews/service/${serviceId}`);
    return res.data;
  }
};
