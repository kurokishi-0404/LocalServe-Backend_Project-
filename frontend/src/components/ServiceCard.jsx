import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import RatingStars from './RatingStars';

const ServiceCard = ({ service }) => {
  if (!service) return null;

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.4rem',
        borderRadius: '20px',
        position: 'relative'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {service.category}
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{service.price}
          </div>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          {service.title}
        </h3>

        <p
          style={{
            fontSize: '0.88rem',
            color: '#64748b',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {service.description}
        </p>
      </div>

      <div>
        <div
          style={{
            borderTop: '1px solid rgba(226, 232, 240, 0.7)',
            paddingTop: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.84rem',
            color: '#475569'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="#2563eb" /> {service.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} color="#10b981" /> {service.availability || 'Available'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {service.provider?.name || 'Local Expert'}
              {service.provider?.isVerified && <ShieldCheck size={14} color="#10b981" />}
            </span>
            <RatingStars rating={service.rating || 5} numReviews={service.numReviews || 0} size={14} />
          </div>
        </div>

        <Link
          to={`/services/${service._id}`}
          className="btn-primary"
          style={{ width: '100%', borderRadius: '12px', fontSize: '0.88rem' }}
        >
          View Service <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
