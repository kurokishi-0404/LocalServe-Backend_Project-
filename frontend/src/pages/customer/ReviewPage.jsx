import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { reviewApi } from '../../services/reviewApi';
import { bookingApi } from '../../services/bookingApi';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Star, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ReviewPage = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [bookingId, setBookingId] = useState(location.state?.bookingId || '');
  const [completedBookings, setCompletedBookings] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If bookingId was not passed in state, fetch user's completed bookings to let them select
    const loadCompletedBookings = async () => {
      if (bookingId) return;
      setFetchingBookings(true);
      try {
        const res = await bookingApi.getBookings();
        if (res.success && Array.isArray(res.data)) {
          const eligible = res.data.filter((b) => {
            const sId = b.service?._id || b.service;
            return b.status === 'completed' && (!serviceId || sId === serviceId);
          });
          setCompletedBookings(eligible);
          if (eligible.length > 0) {
            setBookingId(eligible[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching eligible bookings:', err.message);
      } finally {
        setFetchingBookings(false);
      }
    };

    loadCompletedBookings();
  }, [bookingId, serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingId) {
      setError('Please select a completed booking to review.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a short review comment.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await reviewApi.createReview({
        bookingId,
        rating: Number(rating),
        comment: comment.trim()
      });

      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '2.5rem 1rem' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '26px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <Star size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Rate Your Service</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Share your experience to help local neighbors find great pros
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={52} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Review Published!</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.35rem', marginBottom: '1.75rem' }}>
              Thank you for sharing your feedback on LocalServe.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/customer/bookings" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                My Bookings
              </Link>
              <Link to="/customer/dashboard" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.86rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* If multiple completed bookings, allow selection */}
            {completedBookings.length > 0 && !location.state?.bookingId && (
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Select Completed Booking
                </label>
                <select
                  className="form-input"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                >
                  {completedBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.service?.title || 'Service'} — {new Date(b.bookingDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Star Rating Interactive Selector */}
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                Your Rating: {hoverRating || rating} out of 5 Stars
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{ cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <Star
                      size={34}
                      fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'}
                      color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Detailed Feedback
              </label>
              <textarea
                rows={4}
                required
                className="form-input"
                placeholder="How was the service quality, punctuality, and professionalism?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || fetchingBookings}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
