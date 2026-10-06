import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviceApi } from '../../services/serviceApi';
import { reviewApi } from '../../services/reviewApi';
import { bookingApi } from '../../services/bookingApi';
import { chatApi } from '../../services/chatApi';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  User,
  MessageSquare,
  CheckCircle,
  Tag,
  AlertCircle
} from 'lucide-react';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [address, setAddress] = useState(user?.location || '');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      setError('');
      try {
        const [serviceRes, reviewsRes] = await Promise.all([
          serviceApi.getServiceById(id),
          reviewApi.getServiceReviews(id).catch(() => ({ data: [] }))
        ]);

        if (serviceRes.success && serviceRes.data) {
          setService(serviceRes.data);
        } else {
          setError('Service not found.');
        }

        if (reviewsRes.success && Array.isArray(reviewsRes.data)) {
          setReviews(reviewsRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error loading service details');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id]);

  const handleBookService = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/services/${id}` } } });
      return;
    }
    if (role !== 'customer') {
      setBookingError('Only customer accounts can create bookings. Please login with a customer account.');
      return;
    }
    if (!bookingDate || !address) {
      setBookingError('Please specify date and service address.');
      return;
    }

    setBookingError('');
    setBookingLoading(true);

    try {
      const combinedDateTime = bookingTime ? `${bookingDate}T${bookingTime}` : bookingDate;
      const res = await bookingApi.createBooking({
        serviceId: id,
        bookingDate: combinedDateTime,
        address,
        notes
      });

      if (res.success && res.data) {
        setBookingSuccess(res.data);
        setTimeout(() => {
          navigate(`/customer/bookings/${res.data._id}`);
        }, 1200);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to place booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactProvider = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const providerId = service.provider?._id || service.provider;
    if (!providerId) return;

    try {
      const res = await chatApi.sendMessage({
        recipientId: providerId,
        message: `Hello! I am interested in your service: "${service.title}". Is this currently available?`
      });
      if (res.success && res.data) {
        const targetRoute = role === 'provider' ? `/provider/chat/${res.data._id}` : `/customer/chat/${res.data._id}`;
        navigate(targetRoute);
      }
    } catch (err) {
      alert('Could not start chat: ' + err.message);
    }
  };

  if (loading) return <div className="container" style={{ padding: '3rem 0' }}><LoadingSpinner text="Fetching service details..." /></div>;
  if (error || !service) return <div className="container" style={{ padding: '3rem 0' }}><ErrorMessage message={error || 'Service not found'} /></div>;

  const providerName = service.provider?.name || 'Verified Professional';
  const providerLocation = service.provider?.location || service.location || 'Local Area';

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1.15fr)', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Column: Details, Provider Card, Reviews */}
        <div>
          <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                <Tag size={13} /> {service.category}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={15} /> {service.location}
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '1rem' }}>
              {service.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <RatingStars rating={service.averageRating || 0} reviewsCount={service.numberOfReviews || reviews.length} size={18} />
              {service.duration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <Clock size={16} /> ~{service.duration} mins
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Description
            </h3>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {service.description}
            </p>
          </div>

          {/* Provider Info Card */}
          <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Service Provider
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{providerName}</h4>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                      <ShieldCheck size={13} /> Verified Pro
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.15rem' }}>{providerLocation}</p>
                </div>
              </div>

              <button onClick={handleContactProvider} className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
                <MessageSquare size={16} /> Contact Provider
              </button>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Reviews ({reviews.length})
              </h3>
            </div>

            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' }}>
                No reviews yet for this service. Be the first customer to book and rate it!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((rev) => (
                  <div key={rev._id} style={{ paddingBottom: '1.25rem', borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                        {rev.customer?.name || 'Verified Customer'}
                      </span>
                      <RatingStars rating={rev.rating} reviewsCount={0} size={15} />
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5 }}>{rev.comment}</p>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginTop: '0.4rem' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Real Booking Form */}
        <div style={{ position: 'sticky', top: '5.5rem' }}>
          <div className="glass-panel-static" style={{ padding: '2.25rem 2rem', borderRadius: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Standard Rate</span>
              <div>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563eb' }}>₹{service.price}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}> / service</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Booking Request Sent!</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  Redirecting to your booking tracking page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Schedule an Appointment
                </h4>

                {bookingError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.84rem' }}>
                    <AlertCircle size={16} /> {bookingError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Preferred Time Slot
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Service Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat, Street, Area"
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Notes for Provider (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific requests, problem details..."
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.98rem' }}
                >
                  {bookingLoading ? 'Submitting Booking...' : 'Book Now'}
                </button>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.25rem' }}>
                  ⚡ Real-time status tracking with Socket.io upon confirmation
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
