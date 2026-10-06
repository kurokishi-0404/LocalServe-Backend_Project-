import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { serviceApi } from '../../services/serviceApi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Wrench,
  CalendarCheck,
  CheckCircle,
  TrendingUp,
  Star,
  PlusCircle,
  Radio,
  ArrowRight,
  Clock,
  Check,
  Play,
  X
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { socket, addToast } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        bookingApi.getBookings(),
        serviceApi.getServices()
      ]);

      if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data);
      }
      if (servicesRes.success && Array.isArray(servicesRes.data)) {
        // Filter services belonging to this provider
        const myServices = servicesRes.data.filter((s) => {
          const pId = s.provider?._id || s.provider;
          return pId === (user?._id || user?.id);
        });
        setServices(myServices);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?._id, user?.id]);

  // Real-time Socket.io listener for new booking requests & status updates
  useEffect(() => {
    if (!socket) return;

    const handleNewBooking = (newBooking) => {
      setBookings((prev) => [newBooking, ...prev]);
    };

    const handleBookingStatus = (updated) => {
      setBookings((prev) => {
        const idx = prev.findIndex((b) => b._id === updated._id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return prev;
      });
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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
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
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const revenue = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const rating = user?.rating || 5.0;

  if (loading) return <LoadingSpinner text="Loading provider metrics..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      {/* Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.5rem' }}>
            <Radio size={12} className="live-dot" /> Provider Console Live
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome, {user?.name || 'Partner'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Manage active service assignments, respond to customers, and track revenue
          </p>
        </div>

        <Link to="/provider/services/new" className="btn-emerald" style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem' }}>
          <PlusCircle size={16} /> Add New Service
        </Link>
      </div>

      {/* Real Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Active Listings</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{services.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Published services</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Active Jobs</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{activeBookings.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Pending or ongoing</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Completed</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{completedBookings.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Fulfilled requests</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Total Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>₹{revenue}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>From fulfilled jobs</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Rating</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{rating.toFixed(1)} ★</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Customer feedback</div>
        </div>
      </div>

      {/* Incoming / Active Bookings with Live Status Switchers */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Recent Service Orders ({bookings.length})
          </h2>
          <Link to="/provider/bookings" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Manage All <ArrowRight size={15} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-panel-static" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <CalendarCheck size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>No Bookings Received Yet</h4>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Ensure your services are listed with attractive rates and categories to receive appointments.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b._id}
                className="glass-panel-static"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                      {b.service?.title || 'Service'}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.86rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>Customer: <strong>{b.customer?.name || 'Customer'}</strong></span>
                    <span>Date: <strong>{new Date(b.bookingDate).toLocaleDateString()}</strong></span>
                    <span>Address: <strong>{b.address}</strong></span>
                    <span style={{ color: '#2563eb', fontWeight: 800 }}>₹{b.amount}</span>
                  </div>
                </div>

                {/* Instant Action Transition Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                        disabled={updatingId === b._id}
                        className="btn-emerald"
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <Check size={14} /> Accept & Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'rejected')}
                        disabled={updatingId === b._id}
                        className="btn-danger"
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(b._id, 'in_progress')}
                      disabled={updatingId === b._id}
                      className="btn-primary"
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                    >
                      <Play size={14} /> Start Service
                    </button>
                  )}

                  {b.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(b._id, 'completed')}
                      disabled={updatingId === b._id}
                      className="btn-emerald"
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                    >
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  )}

                  <Link
                    to={`/provider/bookings/${b._id}`}
                    className="btn-secondary"
                    style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
