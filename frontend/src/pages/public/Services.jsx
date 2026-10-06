import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serviceApi } from '../../services/serviceApi';
import { geolocationApi } from '../../services/geolocationApi';
import ServiceCard from '../../components/ServiceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, MapPin, Filter, Navigation, SlidersHorizontal, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'AC Repair',
  'Home Painting',
  'Carpentry',
  'Appliance Repair'
];

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [geoActive, setGeoActive] = useState(false);
  const [geoCoords, setGeoCoords] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      if (geoActive && geoCoords) {
        const res = await geolocationApi.getNearbyServices(
          geoCoords.lat,
          geoCoords.lng,
          15,
          category !== 'All' ? category : ''
        );
        if (res.success) {
          setServices(res.data || []);
        } else {
          setServices([]);
        }
      } else {
        const params = {};
        if (search) params.search = search;
        if (category && category !== 'All') params.category = category;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;

        const res = await serviceApi.getServices(params);
        if (res.success && Array.isArray(res.data)) {
          let list = res.data;
          // Apply client filtering if backend doesn't filter certain fields
          if (maxPrice) {
            list = list.filter((s) => Number(s.price) <= Number(maxPrice));
          }
          if (minRating) {
            list = list.filter((s) => Number(s.averageRating || 0) >= Number(minRating));
          }
          setServices(list);
        } else {
          setServices([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category, geoActive]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoActive(true);
      },
      (err) => {
        alert('Could not access current location: ' + err.message);
      }
    );
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setMaxPrice('');
    setMinRating('');
    setGeoActive(false);
    setGeoCoords(null);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>
          Explore Local Services
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.35rem' }}>
          Browse trusted local experts or find high-rated pros nearby
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel-static" style={{ padding: '1.25rem 1.5rem', borderRadius: '22px', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
            {/* Keyword Search */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Search services (e.g. AC, leak)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <input
                type="number"
                className="form-input"
                placeholder="Max Price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {/* Min Rating Filter */}
            <div>
              <select
                className="form-input"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                <Filter size={16} /> Filter
              </button>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className={geoActive ? 'btn-emerald' : 'btn-secondary'}
                style={{ padding: '0.75rem 1rem' }}
                title="Find services near current GPS location"
              >
                <Navigation size={16} /> Near Me
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: category === cat ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: category === cat ? '#2563eb' : '#ffffff',
                  color: category === cat ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Loading marketplace services..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchServices} />
      ) : services.length === 0 ? (
        <EmptyState
          title="No Services Found"
          message="Try loosening your search terms, changing the category, or clearing filters."
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
              Showing {services.length} {services.length === 1 ? 'service' : 'services'}
              {geoActive && ' (Near GPS Location)'}
            </span>
          </div>
          <div className="grid-cards">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
