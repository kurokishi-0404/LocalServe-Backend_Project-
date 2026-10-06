import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, User, Mail, KeyRound, Phone, MapPin, AlertCircle, Briefcase, Sparkles } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.user?.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div
        className="glass-panel-static"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem'
            }}
          >
            <UserPlus size={26} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Join LocalServe</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Create an account to book or provide local services
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '14px',
              color: '#b91c1c',
              fontSize: '0.86rem',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Role Selector Tabs */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              I want to:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, role: 'customer' }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: formData.role === 'customer' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: formData.role === 'customer' ? '#eff6ff' : '#ffffff',
                  color: formData.role === 'customer' ? '#2563eb' : '#64748b'
                }}
              >
                <Sparkles size={18} /> Book Services
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, role: 'provider' }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: formData.role === 'provider' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: formData.role === 'provider' ? '#ecfdf5' : '#ffffff',
                  color: formData.role === 'provider' ? '#047857' : '#64748b'
                }}
              >
                <Briefcase size={18} /> Provide Services
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                required
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Password (min. 6 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                City / Location
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Pune, MH"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={formData.role === 'provider' ? 'btn-emerald' : 'btn-primary'}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem', fontSize: '0.96rem' }}
          >
            {loading ? 'Creating Account...' : `Register as ${formData.role === 'provider' ? 'Provider' : 'Customer'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
