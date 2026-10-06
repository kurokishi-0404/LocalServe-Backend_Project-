import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, CreditCard, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';

const BookingCard = ({ booking, isProvider = false, onStatusUpdate = null }) => {
  if (!booking) return null;

  const formattedDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Scheduled';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.4rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <StatusBadge status={booking.status} />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{booking.amount}
          </span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
          {booking.service?.title || 'Service Booking'}
        </h3>

        <div style={{ fontSize: '0.86rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="#2563eb" /> {formattedDate}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="#2563eb" /> {booking.address}
          </div>
          <div style={{ color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>
            {isProvider ? `Customer: ${booking.customer?.name || 'Customer'}` : `Provider: ${booking.provider?.name || 'Provider'}`}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.7)', paddingTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Link
          to={isProvider ? `/provider/bookings/${booking._id}` : `/customer/bookings/${booking._id}`}
          className="btn-secondary"
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', borderRadius: '10px' }}
        >
          Details <ArrowRight size={14} />
        </Link>

        {!isProvider && booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
          <Link
            to={`/customer/payment/${booking._id}`}
            className="btn-primary"
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem', borderRadius: '10px' }}
          >
            <CreditCard size={14} /> Pay
          </Link>
        )}

        <Link
          to={isProvider ? `/provider/chat/${booking.customer?._id || booking.customer}` : `/customer/chat/${booking.provider?._id || booking.provider}`}
          className="btn-secondary"
          style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem', borderRadius: '10px' }}
          title="Chat with participant"
        >
          <MessageSquare size={14} />
        </Link>
      </div>
    </div>
  );
};

export default BookingCard;
