import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { serviceApi } from '../../services/serviceApi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import BookingCard from '../../components/BookingCard';
import ServiceCard from '../../components/ServiceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  CreditCard,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Radio
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        bookingApi.getBookings(),
        serviceApi.getServices({ limit: 4 })
      ]);

      if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data);
      }
      if (servicesRes.success && Array.isArray(servicesRes.data)) {
        setRecommendedServices(servicesRes.data.slice(0, 4));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for real-time updates via Socket.io
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
    socket.on('booking:created', handleBookingUpdate);

    return () => {
      socket.off('booking:status', handleBookingUpdate);
      socket.off('booking:updated', handleBookingUpdate);
      socket.off('booking:created', handleBookingUpdate);
    };
  }, [socket]);

  // Derived real metrics from actual backend data
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'in_progress');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalSpending = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading) return <LoadingSpinner text="Loading customer overview..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.5rem' }}>
            <Radio size={12} className="live-dot" /> Live Dashboard
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            Hello, {user?.name?.split(' ')[0] || 'Friend'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Here is your live service activity and scheduled appointments
          </p>
        </div>

        <Link to="/services" className="btn-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem' }}>
          <Sparkles size={16} /> Book a New Service
        </Link>
      </div>

      {/* Real Metric Glass Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Active Requests</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{activeBookings.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>Pending & In-progress</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Confirmed Upcoming</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{upcomingBookings.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>Ready for service</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Completed Jobs</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{completedBookings.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>Fulfilled orders</div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Total Spending</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>₹{totalSpending}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>Across completed jobs</div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Recent Bookings
          </h2>
          <Link to="/customer/bookings" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All ({bookings.length}) <ArrowRight size={15} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-panel-static" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <CalendarCheck size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>No Bookings Yet</h4>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
              You have not booked any local services yet. Browse popular categories to get started.
            </p>
            <Link to="/services" className="btn-primary" style={{ fontSize: '0.88rem' }}>
              Browse Services
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.slice(0, 3).map((booking) => (
              <BookingCard key={booking._id} booking={booking} userRole="customer" />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Services Section */}
      {recommendedServices.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Recommended Services
            </h2>
            <Link to="/services" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Browse Catalog <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-cards">
            {recommendedServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
