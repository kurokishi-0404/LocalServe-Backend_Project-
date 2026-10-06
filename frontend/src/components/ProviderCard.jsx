import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import RatingStars from './RatingStars';

const ProviderCard = ({ provider }) => {
  if (!provider) return null;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              color: '#ffffff',
              fontSize: '1.3rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {provider.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {provider.name}
              {provider.isVerified && (
                <ShieldCheck size={18} color="#10b981" title="Verified Professional" />
              )}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.82rem' }}>
              <MapPin size={14} color="#2563eb" /> {provider.location || 'Local Area'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <RatingStars rating={provider.rating || 5} numReviews={provider.numReviews || 0} size={15} />
        </div>

        <p
          style={{
            fontSize: '0.86rem',
            color: '#475569',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {provider.bio || 'Experienced verified service provider offering premium local assistance.'}
        </p>

        {provider.serviceCategories && provider.serviceCategories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {provider.serviceCategories.map((cat, i) => (
              <span
                key={i}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px'
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link
        to={`/providers/${provider._id}`}
        className="btn-secondary"
        style={{ width: '100%', borderRadius: '12px', fontSize: '0.88rem' }}
      >
        View Profile <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default ProviderCard;
