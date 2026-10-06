import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../services/bookingApi';
import { useSocket } from '../../context/SocketContext';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { CalendarCheck, Radio } from 'lucide-react';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending Requests' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' }
];

const ProviderBookings = () => {
  const { socket, addToast } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getBookings();
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Socket.io real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewBooking = (newBooking) => {
      setBookings((prev) => [newBooking, ...prev]);
      addToast(`New booking request received for "${newBooking.service?.title || 'Service'}"`, 'info');
    };

    const handleBookingStatus = (updated) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? { ...b, ...updated } : b))
      );
    };

    socket.on('booking:created', handleNewBooking);
    socket.on('booking:status', handleBookingStatus);
    socket.on('booking:updated', handleBookingStatus);

    return () => {
      socket.off('booking:created', handleNewBooking);
      socket.off('booking:status', handleBookingStatus);
      socket.off('booking:updated', handleBookingStatus);
    };
  }, [socket]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await bookingApi.updateBookingStatus(bookingId, newStatus);
      if (res.success && res.data) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, ...res.data } : b))
        );
        addToast(`Booking marked as ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.4rem' }}>
            <Radio size={12} className="live-dot" /> Live WebSockets Active
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Client Service Bookings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Accept incoming appointments, update workflow milestones, and manage completion
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.75rem', paddingBottom: '0.25rem' }}>
        {STATUS_TABS.map((tab) => {
          const count = tab.id === 'all'
            ? bookings.length
            : bookings.filter((b) => b.status === tab.id).length;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: isActive ? '1px solid #10b981' : '1px solid #e2e8f0',
                background: isActive ? '#10b981' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569'
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading client bookings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          message={`No service requests matching status "${activeTab}".`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              userRole="provider"
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;
