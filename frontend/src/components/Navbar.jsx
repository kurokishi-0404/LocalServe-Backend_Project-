import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, User, LogOut, LayoutDashboard, Shield, Briefcase } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header style={{ padding: '0 1rem' }}>
      <nav className="navbar-floating">
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Wrench size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Local<span style={{ color: '#2563eb' }}>Serve</span>
          </span>
        </Link>

        {/* Public Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontWeight: 600, fontSize: '0.92rem', color: '#475569' }}>
          <Link to="/" style={{ transition: 'color 0.2s' }}>Home</Link>
          <Link to="/services" style={{ transition: 'color 0.2s' }}>Services</Link>
          <Link to="/providers" style={{ transition: 'color 0.2s' }}>Providers</Link>
        </div>

        {/* Right Action Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          {isAuthenticated ? (
            <>
              <NotificationBell />

              <Link to={getDashboardPath()} className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.3rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                  title={user?.name}
                >
                  {user?.name?.charAt(0) || <User size={16} />}
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#ef4444',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
