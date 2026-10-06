import api from './api';

export const bookingApi = {
  createBooking: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  getBookings: async () => {
    const res = await api.get('/bookings');
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  updateBookingStatus: async (id, status) => {
    const res = await api.put(`/bookings/${id}/status`, { status });
    return res.data;
  }
};
