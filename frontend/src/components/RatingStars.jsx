import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews = null, interactive = false, onSelect = null, size = 16 }) => {
  const currentRating = Math.round(rating);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            fill: star <= (interactive ? rating : currentRating) ? '#f59e0b' : 'none',
            color: star <= (interactive ? rating : currentRating) ? '#f59e0b' : '#cbd5e1',
            transition: 'all 0.15s ease'
          }}
          onClick={() => interactive && onSelect && onSelect(star)}
        />
      ))}
      {numReviews !== null && (
        <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: '0.35rem' }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
