import React, { useState, useEffect } from 'react';
import { serviceApi } from '../../services/serviceApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import RatingStars from '../../components/RatingStars';
import { Wrench, Trash2, Tag, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await serviceApi.getServices();
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('As an Administrator, are you sure you want to remove this service listing from the marketplace?')) return;
    setDeletingId(id);
    try {
      const res = await serviceApi.deleteService(id);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Global Service Catalog Audit
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Inspect marketplace offerings, pricing, compliance, and remove inappropriate listings
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading marketplace services..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchServices} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {services.map((service) => (
            <div
              key={service._id}
              className="glass-panel-static"
              style={{
                padding: '1.5rem',
                borderRadius: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Tag size={12} /> {service.category}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} /> {service.location}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {service.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.86rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>Provider: <strong>{service.provider?.name || 'Provider'}</strong></span>
                  <span style={{ color: '#2563eb', fontWeight: 800 }}>₹{service.price}</span>
                  <RatingStars rating={service.averageRating || 0} reviewsCount={service.numberOfReviews || 0} size={14} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link
                  to={`/services/${service._id}`}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                >
                  <Eye size={14} /> View
                </Link>
                <button
                  onClick={() => handleDelete(service._id)}
                  disabled={deletingId === service._id}
                  className="btn-danger"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                >
                  <Trash2 size={14} /> {deletingId === service._id ? 'Removing...' : 'Delete Listing'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminServices;
