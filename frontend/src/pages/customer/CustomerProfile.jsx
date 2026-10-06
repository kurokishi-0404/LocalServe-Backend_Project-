import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, ShieldCheck, Flame, LogOut } from 'lucide-react';

const CustomerProfile = () => {
  const { user, firebaseUser, logout } = useAuth();

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          My Profile & Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Manage your account credentials, contact information, and verification status
        </p>
      </div>

      <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{user?.name || 'Local Customer'}</h2>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                {user?.role || 'Customer'}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Email Address</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                <Mail size={16} color="#2563eb" /> {user?.email}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Phone Number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                <Phone size={16} color="#10b981" /> {user?.phone || 'Not provided'}
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Default Location / Address</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
              <MapPin size={16} color="#ef4444" /> {user?.location || 'Pune, India'}
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Auth Status Card */}
      {firebaseUser && (
        <div className="glass-panel-static" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Flame size={20} color="#ea580c" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Firebase Authentication Session</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Verified against backend endpoint <code>GET /api/auth/firebase-profile</code> using Firebase Admin SDK.
          </p>
          <div style={{ fontSize: '0.84rem', color: '#334155', background: '#fff7ed', padding: '1rem', borderRadius: '14px', fontFamily: 'monospace' }}>
            <div><strong>UID:</strong> {firebaseUser.uid}</div>
            <div><strong>Email:</strong> {firebaseUser.email}</div>
            <div><strong>Verified:</strong> {firebaseUser.email_verified ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      <div>
        <button
          onClick={logout}
          className="btn-danger"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
        >
          <LogOut size={16} /> Log Out of Account
        </button>
      </div>
    </div>
  );
};

export default CustomerProfile;
