import React, { useState } from 'react';
import { Search, MapPin, LocateFixed, ArrowRight } from 'lucide-react';

const SearchBar = ({ onSearch, initialQuery = '', initialLocation = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [locating, setLocating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query: query.trim(), location: location.trim() });
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        if (onSearch) {
          onSearch({
            query: query.trim(),
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            radius: 15
          });
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation denied or unavailable:', err.message);
        alert('Could not detect location. Please enter your location manually.');
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel"
      style={{
        padding: '0.6rem 0.8rem',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1.2, paddingLeft: '0.75rem' }}>
        <Search size={18} color="#2563eb" />
        <input
          type="text"
          placeholder="What service do you need? (e.g. Electrical, AC Repair)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none' }}
        />
      </div>

      <div style={{ height: '24px', width: '1px', background: 'rgba(203, 213, 225, 0.8)' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, paddingLeft: '0.5rem' }}>
        <MapPin size={18} color="#10b981" />
        <input
          type="text"
          placeholder="Where? (City or area)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none' }}
        />
        <button
          type="button"
          onClick={handleDetectLocation}
          title="Use current GPS location"
          style={{
            padding: '0.4rem',
            color: locating ? '#10b981' : '#64748b',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LocateFixed size={18} style={{ animation: locating ? 'pulse 1s infinite' : 'none' }} />
        </button>
      </div>

      <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.6rem' }}>
        Search <ArrowRight size={16} />
      </button>
    </form>
  );
};

export default SearchBar;
