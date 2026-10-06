import api from './api';

export const paymentApi = {
  createPayment: async (paymentData) => {
    const res = await api.post('/payments', paymentData);
    return res.data;
  },

  getPaymentsByBooking: async (bookingId) => {
    const res = await api.get(`/payments/booking/${bookingId}`);
    return res.data;
  }
};
