import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ marginTop: '5rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)', padding: '3.5rem 1rem 2rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Wrench size={16} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Local<span style={{ color: '#2563eb' }}>Serve</span>
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
            The hyperlocal service marketplace connecting local residents with verified professionals for home repairs, maintenance, and installations.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Explore
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#64748b' }}>
            <li><Link to="/services" style={{ transition: 'color 0.2s' }}>All Services</Link></li>
            <li><Link to="/providers" style={{ transition: 'color 0.2s' }}>Verified Providers</Link></li>
            <li><Link to="/services?category=Electrical" style={{ transition: 'color 0.2s' }}>Electrical Work</Link></li>
            <li><Link to="/services?category=Plumbing" style={{ transition: 'color 0.2s' }}>Plumbing Solutions</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Account
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#64748b' }}>
            <li><Link to="/login" style={{ transition: 'color 0.2s' }}>Login</Link></li>
            <li><Link to="/register" style={{ transition: 'color 0.2s' }}>Register as Customer</Link></li>
            <li><Link to="/register" style={{ transition: 'color 0.2s' }}>Join as Service Provider</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Platform Architecture
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.6 }}>
            Powered by Node.js, Express, MongoDB Atlas, Socket.io for real-time updates, and Firebase Authentication.
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)', paddingTop: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
        © {new Date().getFullYear()} LocalServe. Built for B.Tech CSE Viva Demonstration.
      </div>
    </footer>
  );
};

export default Footer;
