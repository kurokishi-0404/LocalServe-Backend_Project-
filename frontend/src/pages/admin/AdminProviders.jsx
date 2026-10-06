import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { ShieldCheck, ShieldAlert, Check, X, Search, User } from 'lucide-react';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getProviders();
      if (res.success && Array.isArray(res.data)) {
        setProviders(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleVerification = async (providerId, currentStatus) => {
    setUpdatingId(providerId);
    try {
      const newStatus = !currentStatus;
      const res = await adminApi.verifyProvider(providerId, newStatus);
      if (res.success) {
        setProviders((prev) =>
          prev.map((p) =>
            p._id === providerId ? { ...p, isVerified: newStatus } : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update verification');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = providers.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Provider Verification Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Audit service provider compliance and toggle verified platform badges
        </p>
      </div>

      <div className="glass-panel-static" style={{ padding: '1rem 1.25rem', borderRadius: '18px', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.6rem' }}
            placeholder="Search providers by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching provider database..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProviders} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Providers Found" message="No service providers matched your search." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((prov) => (
            <div
              key={prov._id}
              className="glass-panel-static"
              style={{
                padding: '1.5rem',
                borderRadius: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: prov.isVerified ? '#ecfdf5' : '#fffbeb', color: prov.isVerified ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prov.name}</h3>
                    {prov.isVerified ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.74rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                        <ShieldCheck size={13} /> Verified
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.74rem', fontWeight: 700, color: '#b45309', background: '#fffbeb', padding: '0.2rem 0.55rem', borderRadius: '999px', border: '1px solid #fde68a' }}>
                        <ShieldAlert size={13} /> Pending Audit
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>Email: <strong>{prov.email}</strong></span>
                    <span>City: <strong>{prov.location || 'Not set'}</strong></span>
                    <span>Listings: <strong>{prov.servicesCount || 0}</strong></span>
                    <span>Bookings: <strong>{prov.bookingsCount || 0}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleToggleVerification(prov._id, prov.isVerified)}
                  disabled={updatingId === prov._id}
                  className={prov.isVerified ? 'btn-secondary' : 'btn-emerald'}
                  style={{ padding: '0.6rem 1.15rem', fontSize: '0.86rem' }}
                >
                  {updatingId === prov._id ? (
                    'Updating...'
                  ) : prov.isVerified ? (
                    <>
                      <X size={15} color="#ef4444" /> Revoke Verification
                    </>
                  ) : (
                    <>
                      <Check size={15} /> Approve & Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
