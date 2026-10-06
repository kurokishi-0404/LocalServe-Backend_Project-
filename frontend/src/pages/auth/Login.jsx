import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Flame, KeyRound, Mail, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithFirebase } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  const [error, setError] = useState('');
  const [firebaseSuccess, setFirebaseSuccess] = useState(null);

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    else if (role === 'provider') navigate('/provider/dashboard', { replace: true });
    else navigate('/customer/dashboard', { replace: true });
  };

  const handleJwtLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      redirectAfterLogin(res.user?.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseLogin = async () => {
    if (!email || !password) {
      setError('Enter email and password above to authenticate with Firebase.');
      return;
    }
    setError('');
    setFirebaseLoading(true);
    try {
      const res = await loginWithFirebase(email, password);
      setFirebaseSuccess(res.profile || { uid: res.credential.user.uid, email: res.credential.user.email });
    } catch (err) {
      setError(`Firebase Auth Error: ${err.message}`);
    } finally {
      setFirebaseLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div
        className="glass-panel-static"
        style={{
          width: '100%',
          maxWidth: '460px',
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
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem'
            }}
          >
            <LogIn size={26} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Sign in with JWT or Firebase Authentication
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

        {firebaseSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '14px',
              color: '#065f46',
              fontSize: '0.86rem',
              marginBottom: '1.5rem'
            }}
          >
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700 }}>Firebase Verified by Backend!</div>
              <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                UID: {firebaseSuccess.uid}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleJwtLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In with JWT'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Or Test Firebase Auth</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={handleFirebaseLogin}
          disabled={firebaseLoading}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #f97316',
            color: '#c2410c',
            background: 'rgba(255, 237, 213, 0.5)'
          }}
        >
          <Flame size={18} color="#ea580c" />
          {firebaseLoading ? 'Verifying with Firebase...' : 'Verify Firebase ID Token'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
