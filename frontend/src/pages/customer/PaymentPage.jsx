import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { paymentApi } from '../../services/paymentApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [method, setMethod] = useState('upi'); // upi, card, cash
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [payLoading, setPayLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await bookingApi.getBookingById(bookingId);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error loading booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    setError('');

    try {
      const res = await paymentApi.createPayment({
        bookingId,
        amount: booking.amount,
        paymentMethod: method,
        status: 'paid'
      });

      if (res.success && res.data) {
        setPaymentSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment simulation failed');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing payment gateway..." />;
  if (error && !booking) return <ErrorMessage message={error} />;

  return (
    <div className="container" style={{ maxWidth: '650px', padding: '2.5rem 1rem' }}>
      <button
        onClick={() => navigate(`/customer/bookings/${bookingId}`)}
        className="btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Booking
      </button>

      <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '26px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(226, 232, 240, 0.7)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'uppercase' }}>
              Demo Payment Mode
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              Complete Payment
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Payable</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb' }}>₹{booking?.amount}</div>
          </div>
        </div>

        {paymentSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle size={38} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Payment Confirmed!</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.35rem' }}>
              Receipt successfully recorded in the MongoDB backend.
            </p>

            <div className="glass-panel-static" style={{ margin: '1.5rem auto', padding: '1.25rem', maxWidth: '420px', textAlign: 'left', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Transaction ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{paymentSuccess.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Method:</span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{paymentSuccess.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ fontWeight: 700, color: '#047857' }}>{paymentSuccess.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <Link to={`/customer/bookings/${bookingId}`} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                View Booking
              </Link>
              <Link to="/customer/dashboard" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProcessPayment}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.6rem' }}>
                Select Demo Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: method === 'upi' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: method === 'upi' ? '#eff6ff' : '#ffffff',
                    color: method === 'upi' ? '#2563eb' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <QrCode size={22} />
                  UPI / QR
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: method === 'card' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: method === 'card' ? '#eff6ff' : '#ffffff',
                    color: method === 'card' ? '#2563eb' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <CreditCard size={22} />
                  Debit/Credit
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: method === 'cash' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: method === 'cash' ? '#eff6ff' : '#ffffff',
                    color: method === 'cash' ? '#2563eb' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <Banknote size={22} />
                  Cash (COD)
                </button>
              </div>
            </div>

            {/* Method Details */}
            {method === 'upi' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  UPI Virtual ID
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                />
              </div>
            )}

            {method === 'card' && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input type="text" className="form-input" placeholder="MM/YY" defaultValue="12/28" />
                  <input type="password" className="form-input" placeholder="CVV" defaultValue="982" maxLength={3} />
                </div>
              </div>
            )}

            {method === 'cash' && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '14px', fontSize: '0.86rem', color: '#64748b' }}>
                Pay cash directly to the professional upon service arrival or fulfillment.
              </div>
            )}

            <button
              type="submit"
              disabled={payLoading}
              className="btn-emerald"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {payLoading ? 'Recording Payment...' : `Simulate Pay ₹${booking?.amount}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
