import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  User,
  Wrench,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const Sidebar = () => {
  const { role, user } = useAuth();

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/customer/profile', label: 'Profile', icon: User }
  ];

  const providerLinks = [
    { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/provider/services', label: 'My Services', icon: Wrench },
    { to: '/provider/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/provider/profile', label: 'Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/providers', label: 'Providers', icon: ShieldCheck },
    { to: '/admin/disputes', label: 'Disputes', icon: AlertTriangle }
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'provider'
      ? providerLinks
      : customerLinks;

  return (
    <aside
      className="dashboard-sidebar glass-panel-static"
      style={{
        padding: '1.25rem 1rem',
        borderRadius: '24px',
        height: 'fit-content'
      }}
    >
      <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }}>
        <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
          {role?.toUpperCase()} PORTAL
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
          {user?.name || 'My Account'}
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#2563eb' : '#475569',
                background: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.18s ease'
              })}
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
