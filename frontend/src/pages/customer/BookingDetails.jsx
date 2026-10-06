import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { chatApi } from '../../services/chatApi';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import BookingTimeline from '../../components/BookingTimeline';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Radio
} from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { socket, joinBookingRoom, addToast } = useSocket();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getBookingById(id);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Join Socket.io booking room for real-time live events
  useEffect(() => {
    if (!id) return;
    joinBookingRoom(id);

    if (!socket) return;

    const handleStatusUpdate = (data) => {
      if (data._id === id || data.bookingId === id) {
        setBooking((prev) => ({
          ...prev,
          status: data.status || prev.status,
          ...(data.booking || {})
        }));
        addToast(`Booking status updated to ${data.status?.toUpperCase()}`, 'info');
      }
    };

    socket.on('booking:status', handleStatusUpdate);
    socket.on('booking:updated', handleStatusUpdate);

    return () => {
      socket.off('booking:status', handleStatusUpdate);
      socket.off('booking:updated', handleStatusUpdate);
    };
  }, [id, socket]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(true);
    try {
      const res = await bookingApi.updateBookingStatus(id, 'cancelled');
      if (res.success) {
        setBooking(res.data);
        addToast('Booking cancelled successfully', 'info');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = async () => {
    const providerId = booking?.provider?._id || booking?.provider;
    if (!providerId) return;

    try {
      const res = await chatApi.sendMessage({
        recipientId: providerId,
        bookingId: booking._id,
        message: `Hello, inquiring about my booking for "${booking.service?.title || 'service'}" scheduled on ${new Date(booking.bookingDate).toLocaleDateString()}.`
      });
      if (res.success && res.data) {
        navigate(`/customer/chat/${res.data._id}`);
      }
    } catch (err) {
      alert('Could not start chat: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading booking status..." />;
  if (error || !booking) return <ErrorMessage message={error || 'Booking not found'} onRetry={fetchBooking} />;

  const service = booking.service || {};
  const provider = booking.provider || {};
  const isPaid = booking.paymentStatus === 'paid';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canPay = !isPaid && ['confirmed', 'in_progress', 'completed'].includes(booking.status);
  const canReview = booking.status === 'completed';

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.4rem' }}>
            <Radio size={12} className="live-dot" /> Live Room Connected
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            Booking #{booking._id?.slice(-6).toUpperCase()}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Created on {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status={booking.status} />
          <span
            style={{
              padding: '0.28rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: isPaid ? '#ecfdf5' : '#fffbeb',
              color: isPaid ? '#047857' : '#b45309',
              border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`
            }}
          >
            {isPaid ? 'Payment Received' : 'Payment Pending'}
          </span>
        </div>
      </div>

      {/* Real-time Interactive Status Timeline */}
      <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Service Progress
        </h3>
        <BookingTimeline currentStatus={booking.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1.2fr)', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Service & Schedule */}
          <div className="glass-panel-static" style={{ padding: '1.75rem', borderRadius: '22px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Service Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Service Title</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {service.title || 'Local Service'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Scheduled Date & Time</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <Calendar size={16} color="#2563eb" /> {new Date(booking.bookingDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Service Fee</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                    ₹{booking.amount}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Service Address</span>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <MapPin size={16} color="#ef4444" /> {booking.address}
                </div>
              </div>

              {booking.notes && (
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Special Notes</span>
                  <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.2rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}>
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Provider Card */}
          <div className="glass-panel-static" style={{ padding: '1.75rem', borderRadius: '22px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Assigned Professional
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {provider.name || 'Service Provider'}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#64748b' }}>
                    {provider.phone || provider.email || 'Verified on LocalServe'}
                  </div>
                </div>
              </div>

              <button onClick={handleOpenChat} className="btn-secondary" style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem' }}>
                <MessageSquare size={16} /> Open Chat
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '22px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Manage Booking
          </h3>

          {/* Pay Button */}
          {canPay && (
            <Link
              to={`/customer/payment/${booking._id}`}
              className="btn-emerald"
              style={{ padding: '0.85rem', width: '100%', textAlign: 'center' }}
            >
              <CreditCard size={18} /> Pay ₹{booking.amount} Now
            </Link>
          )}

          {/* Review Button */}
          {canReview && (
            <Link
              to={`/customer/reviews/${service._id || service}`}
              state={{ bookingId: booking._id }}
              className="btn-primary"
              style={{ padding: '0.85rem', width: '100%', textAlign: 'center' }}
            >
              <Star size={18} /> Rate & Review Service
            </Link>
          )}

          {/* Cancel Button */}
          {canCancel && (
            <button
              onClick={handleCancelBooking}
              disabled={actionLoading}
              className="btn-danger"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <XCircle size={16} /> {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}

          <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            💡 Any status change made by the provider updates here in real-time through WebSockets without needing a page reload.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
