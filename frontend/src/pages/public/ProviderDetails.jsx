import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerApi } from '../../services/providerApi';
import { chatApi } from '../../services/chatApi';
import { useAuth } from '../../context/AuthContext';
import ServiceCard from '../../components/ServiceCard';
import RatingStars from '../../components/RatingStars';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  Briefcase
} from 'lucide-react';

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProvider = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await providerApi.getProviderById(id);
        if (res.success && res.data) {
          setProvider(res.data.provider);
          setServices(res.data.services || []);
        } else {
          setError('Provider not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error loading provider profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatApi.sendMessage({
        recipientId: id,
        message: 'Hello! I saw your profile on LocalServe and would like to inquire about your services.'
      });
      if (res.success && res.data) {
        navigate(role === 'provider' ? `/provider/chat/${res.data._id}` : `/customer/chat/${res.data._id}`);
      }
    } catch (err) {
      alert('Could not open chat: ' + err.message);
    }
  };

  if (loading) return <div className="container" style={{ padding: '3rem 0' }}><LoadingSpinner text="Loading provider profile..." /></div>;
  if (error || !provider) return <div className="container" style={{ padding: '3rem 0' }}><ErrorMessage message={error || 'Provider not found'} /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Provider Hero Card */}
      <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '26px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '26px',
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={42} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
                  {provider.name}
                </h1>
                {provider.isVerified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                    <ShieldCheck size={15} /> Verified Provider
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', color: '#64748b', fontSize: '0.92rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={16} /> {provider.location || 'Local Area'}
                </span>
                {provider.experience && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={16} /> {provider.experience} yrs experience
                  </span>
                )}
                <RatingStars rating={provider.rating || 0} reviewsCount={0} size={16} />
              </div>
            </div>
          </div>

          <div>
            <button onClick={handleStartChat} className="btn-primary" style={{ padding: '0.8rem 1.6rem' }}>
              <MessageSquare size={18} /> Message Provider
            </button>
          </div>
        </div>

        {provider.bio && (
          <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
              About
            </h3>
            <p style={{ color: '#475569', fontSize: '0.96rem', lineHeight: 1.65 }}>
              {provider.bio}
            </p>
          </div>
        )}

        {Array.isArray(provider.serviceCategories) && provider.serviceCategories.length > 0 && (
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {provider.serviceCategories.map((cat, idx) => (
              <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: '999px' }}>
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Services Listed By This Provider */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Services by {provider.name} ({services.length})
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Choose an offering to schedule directly
          </p>
        </div>

        {services.length === 0 ? (
          <div className="glass-panel-static" style={{ textAlign: 'center', padding: '3rem', borderRadius: '22px' }}>
            <Briefcase size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#64748b' }}>This provider has not published any active listings yet.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;
