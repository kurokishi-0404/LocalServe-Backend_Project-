import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, XCircle } from 'lucide-react';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionText, setResolutionText] = useState({});

  const fetchDisputes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDisputes();
      if (res.success && Array.isArray(res.data)) {
        setDisputes(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (disputeId, status) => {
    setResolvingId(disputeId);
    try {
      const resolution = resolutionText[disputeId] || `Marked ${status} by Administrator`;
      const res = await adminApi.resolveDispute(disputeId, { status, resolution });
      if (res.success && res.data) {
        setDisputes((prev) =>
          prev.map((d) => (d._id === disputeId ? { ...d, ...res.data } : d))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update dispute');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Customer & Provider Disputes Desk
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Investigate booking incident reports, mediate resolutions, and enforce platform standards
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving dispute cases..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchDisputes} />
      ) : disputes.length === 0 ? (
        <EmptyState
          title="All Cases Clear"
          message="There are no active or escalated booking disputes in the system."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {disputes.map((disp) => {
            const isResolved = disp.status === 'resolved';

            return (
              <div
                key={disp._id}
                className="glass-panel-static"
                style={{
                  padding: '1.75rem',
                  borderRadius: '22px',
                  borderLeft: `4px solid ${isResolved ? '#10b981' : '#f59e0b'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '999px', background: isResolved ? '#ecfdf5' : '#fffbeb', color: isResolved ? '#047857' : '#b45309' }}>
                        {disp.status}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Case #{disp._id?.slice(-6).toUpperCase()} • {new Date(disp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
                      {disp.reason}
                    </h3>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>
                    <div>Customer: <strong>{disp.customer?.name || 'Customer'}</strong></div>
                    <div>Provider: <strong>{disp.provider?.name || 'Provider'}</strong></div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Dispute Details:</span>
                  <p style={{ fontSize: '0.92rem', color: '#334155', marginTop: '0.2rem', lineHeight: 1.5 }}>
                    {disp.description}
                  </p>
                </div>

                {disp.resolution && (
                  <div style={{ background: '#ecfdf5', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>Admin Resolution Note:</span>
                    <p style={{ fontSize: '0.88rem', color: '#065f46', marginTop: '0.15rem' }}>
                      {disp.resolution}
                    </p>
                  </div>
                )}

                {!isResolved && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: '1 1 250px', padding: '0.55rem 0.85rem', fontSize: '0.88rem' }}
                      placeholder="Enter resolution notes (e.g. Refund issued)..."
                      value={resolutionText[disp._id] || ''}
                      onChange={(e) =>
                        setResolutionText((prev) => ({ ...prev, [disp._id]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => handleResolve(disp._id, 'resolved')}
                      disabled={resolvingId === disp._id}
                      className="btn-emerald"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    >
                      <CheckCircle size={15} /> Resolve Case
                    </button>
                    <button
                      onClick={() => handleResolve(disp._id, 'rejected')}
                      disabled={resolvingId === disp._id}
                      className="btn-danger"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
