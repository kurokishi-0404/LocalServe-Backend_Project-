import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import ServiceCard from '../../components/ServiceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { serviceApi } from '../../services/serviceApi';
import {
  Wrench,
  Zap,
  Sparkles,
  Wind,
  Paintbrush,
  Hammer,
  ShieldCheck,
  Clock,
  Radio,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceApi.getServices();
        if (res.success && Array.isArray(res.data)) {
          setFeaturedServices(res.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured services:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleSearch = ({ query, location, lat, lng, radius }) => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (location) params.append('location', location);
    if (lat && lng) {
      params.append('lat', lat);
      params.append('lng', lng);
      params.append('radius', radius || 10);
    }
    navigate(`/services?${params.toString()}`);
  };

  const categories = [
    { name: 'Electrical', icon: Zap, color: '#2563eb', bg: '#eff6ff' },
    { name: 'Plumbing', icon: Wrench, color: '#0284c7', bg: '#f0f9ff' },
    { name: 'Cleaning', icon: Sparkles, color: '#10b981', bg: '#ecfdf5' },
    { name: 'AC Repair', icon: Wind, color: '#06b6d4', bg: '#ecfeff' },
    { name: 'Home Painting', icon: Paintbrush, color: '#8b5cf6', bg: '#f5f3ff' },
    { name: 'Carpentry', icon: Hammer, color: '#f59e0b', bg: '#fffbeb' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '5rem 1rem 3.5rem', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginBottom: '1.5rem' }}>
          <Radio size={14} className="live-dot" /> Live Hyperlocal Marketplace
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem', color: '#0f172a' }}>
          Find trusted local services <br />
          <span style={{ background: 'linear-gradient(135deg, #2563eb, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            near you in seconds.
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '620px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Book verified, skilled service professionals for home repairs, maintenance, and installations with real-time status updates.
        </p>

        {/* Search Panel */}
        <div style={{ marginBottom: '4rem' }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Categories Bar */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => navigate(`/services?category=${cat.name}`)}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem 0.75rem',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.6rem',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="container" style={{ padding: '3rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Handpicked Offerings
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              Popular Services in Your Area
            </h2>
          </div>
          <Link to="/services" className="btn-secondary" style={{ fontSize: '0.86rem' }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching available services..." />
        ) : featuredServices.length === 0 ? (
          <div className="glass-panel-static" style={{ textAlign: 'center', padding: '3rem', borderRadius: '20px' }}>
            <p style={{ color: '#64748b' }}>No services available right now. Check back soon or register as a provider!</p>
          </div>
        ) : (
          <div className="grid-cards">
            {featuredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Architecture Showcase */}
      <section className="container" style={{ padding: '3rem 1rem' }}>
        <div className="glass-panel-static" style={{ borderRadius: '28px', padding: '3rem 2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              Engineered for Seamless Local Service
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Built with an enterprise-grade stack incorporating real-time updates and cloud authentication.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified Providers</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Every professional profile undergoes admin verification to guarantee skill standards and community safety.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Clock size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Socket.io Live Updates</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Track booking status changes (pending to confirmed to completed) instantly without page refreshes.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Firebase Auth Ready</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Integrated with Google's Firebase Admin SDK alongside JWT authentication for robust user identification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
