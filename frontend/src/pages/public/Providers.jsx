import React, { useState, useEffect } from 'react';
import { providerApi } from '../../services/providerApi';
import ProviderCard from '../../components/ProviderCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, ShieldCheck } from 'lucide-react';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (verifiedOnly) params.verified = 'true';
      const res = await providerApi.getProviders(params);
      if (res.success && Array.isArray(res.data)) {
        setProviders(res.data);
      } else {
        setProviders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [verifiedOnly]);

  const filteredProviders = providers.filter((p) => {
    if (!searchTerm) return true;
    const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const locMatch = p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = Array.isArray(p.serviceCategories) && p.serviceCategories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return nameMatch || locMatch || catMatch;
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>
          Certified Service Professionals
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.35rem' }}>
          Connect with trusted, background-checked local service experts in your area
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel-static" style={{ padding: '1.25rem 1.5rem', borderRadius: '22px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.6rem' }}
              placeholder="Search by name, location, or trade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={17} color="#10b981" /> Verified Only
            </span>
          </label>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Locating local providers..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProviders} />
      ) : filteredProviders.length === 0 ? (
        <EmptyState
          title="No Providers Found"
          message="No service providers matched your search or filters."
          actionText="Show All Providers"
          onAction={() => { setSearchTerm(''); setVerifiedOnly(false); }}
        />
      ) : (
        <div className="grid-cards">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider._id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Providers;
