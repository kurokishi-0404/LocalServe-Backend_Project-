import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceApi } from '../../services/serviceApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import RatingStars from '../../components/RatingStars';
import { PlusCircle, Edit3, Trash2, Tag, MapPin, Eye } from 'lucide-react';

const ProviderServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await serviceApi.getServices();
      if (res.success && Array.isArray(res.data)) {
        const myServices = res.data.filter((s) => {
          const pId = s.provider?._id || s.provider;
          return pId === (user?._id || user?.id);
        });
        setServices(myServices);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, [user?._id, user?.id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) return;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            My Published Services
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Manage service catalog, pricing, and availability shown to local customers
          </p>
        </div>

        <Link to="/provider/services/new" className="btn-emerald" style={{ fontSize: '0.88rem' }}>
          <PlusCircle size={16} /> Add New Service
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your services..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMyServices} />
      ) : services.length === 0 ? (
        <EmptyState
          title="No Services Listed"
          message="You have not published any service offerings yet. Create your first listing to start getting customer appointments!"
          actionText="Create Service Listing"
          onAction={() => navigate('/provider/services/new')}
        />
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
                gap: '1.25rem'
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

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  {service.title}
                </h3>

                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, maxHeight: '2.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {service.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                    ₹{service.price}
                  </span>
                  <RatingStars rating={service.averageRating || 0} reviewsCount={service.numberOfReviews || 0} size={15} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Link
                  to={`/services/${service._id}`}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 0.9rem', fontSize: '0.84rem' }}
                  title="View Public Page"
                >
                  <Eye size={15} /> View
                </Link>

                <Link
                  to={`/provider/services/${service._id}/edit`}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 0.9rem', fontSize: '0.84rem' }}
                  title="Edit Service"
                >
                  <Edit3 size={15} /> Edit
                </Link>

                <button
                  onClick={() => handleDelete(service._id)}
                  disabled={deletingId === service._id}
                  className="btn-danger"
                  style={{ padding: '0.55rem 0.9rem', fontSize: '0.84rem' }}
                  title="Delete Service"
                >
                  <Trash2 size={15} /> {deletingId === service._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderServices;
