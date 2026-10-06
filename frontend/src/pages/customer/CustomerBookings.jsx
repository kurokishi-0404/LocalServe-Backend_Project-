import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { useSocket } from '../../context/SocketContext';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { CalendarCheck, Radio } from 'lucide-react';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
];

const CustomerBookings = () => {
  const { socket } = useSocket();
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
      setError(err.response?.data?.message || err.message || 'Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (updatedBooking) => {
      setBookings((prev) => {
        const index = prev.findIndex((b) => b._id === updatedBooking._id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = { ...next[index], ...updatedBooking };
          return next;
        }
        return [updatedBooking, ...prev];
      });
    };

    socket.on('booking:status', handleBookingUpdate);
    socket.on('booking:updated', handleBookingUpdate);

    return () => {
      socket.off('booking:status', handleBookingUpdate);
      socket.off('booking:updated', handleBookingUpdate);
    };
  }, [socket]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.4rem' }}>
            <Radio size={12} className="live-dot" /> Live Updates Connected
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            My Service Bookings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Track appointment progress, verify service completion, and settle payments
          </p>
        </div>

        <Link to="/services" className="btn-primary" style={{ fontSize: '0.88rem' }}>
          + New Booking
        </Link>
      </div>

      {/* Status Filter Tabs */}
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
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: isActive ? '#2563eb' : '#ffffff',
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

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Fetching your bookings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No Bookings in this Status"
          message={activeTab === 'all' ? "You haven't booked any service yet." : `You have 0 bookings marked as "${activeTab}".`}
          actionText="Explore Marketplace"
          onAction={() => {}}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} userRole="customer" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
