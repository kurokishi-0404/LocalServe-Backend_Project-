import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { serviceApi } from '../../services/serviceApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const [providers, setProviders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [provRes, dispRes, servRes] = await Promise.all([
        adminApi.getProviders(),
        adminApi.getDisputes(),
        serviceApi.getServices()
      ]);

      if (provRes.success) setProviders(provRes.data || []);
      if (dispRes.success) setDisputes(dispRes.data || []);
      if (servRes.success) setServices(servRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const verifiedCount = providers.filter((p) => p.isVerified).length;
  const pendingVerification = providers.length - verifiedCount;
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'under_review').length;
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved').length;

  if (loading) return <LoadingSpinner text="Loading system administrator console..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.5rem' }}>
          <Shield size={13} /> Platform Administrator
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
          Marketplace Operations Console
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Monitor provider accreditations, resolve transaction disputes, and maintain catalog integrity
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Total Providers</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{providers.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>
            {verifiedCount} verified ({pendingVerification} pending)
          </div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Active Disputes</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{openDisputes}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            {resolvedDisputes} resolved total
          </div>
        </div>

        <div className="glass-panel-static" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Catalog Services</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{services.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Live on marketplace</div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Provider Verification</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{pendingVerification} pending review</p>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Review registered service professionals, verify credentials and safety standards, and toggle verification badges.
          </p>
          <Link to="/admin/providers" className="btn-primary" style={{ fontSize: '0.88rem', width: '100%', textAlign: 'center' }}>
            Manage Providers <ArrowRight size={15} />
          </Link>
        </div>

        <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Dispute Resolution</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{openDisputes} open cases</p>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Investigate customer booking escalations, arbitrate refunds or adjustments, and log official resolutions.
          </p>
          <Link to="/admin/disputes" className="btn-secondary" style={{ fontSize: '0.88rem', width: '100%', textAlign: 'center' }}>
            Open Disputes Desk <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
