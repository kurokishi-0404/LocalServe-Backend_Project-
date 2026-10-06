import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Users, User, Shield, Briefcase, Mail, MapPin } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // For admin, we can load the providers from adminApi and list current users
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getProviders();
        if (res.success && Array.isArray(res.data)) {
          setUsers(res.data);
        }
      } catch (err) {
        setError(err.message || 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          User Accounts & Access Directory
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Audit active platform participants, system permissions, and account roles
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user directory..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((u) => (
            <div
              key={u._id}
              className="glass-panel-static"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{u.name}</h3>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px', background: '#eff6ff', color: '#2563eb', textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Mail size={14} /> {u.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} /> {u.location || 'Local Area'}
                    </span>
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
