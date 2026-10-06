import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi } from '../../services/serviceApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Wrench, Navigation, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Cleaning',
  'AC Repair',
  'Home Painting',
  'Carpentry',
  'Appliance Repair',
  'Pest Control'
];

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electrical',
    price: '',
    availability: 'Available',
    location: user?.location || '',
    latitude: '',
    longitude: ''
  });

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchService = async () => {
        try {
          const res = await serviceApi.getServiceById(id);
          if (res.success && res.data) {
            setFormData({
              title: res.data.title || '',
              description: res.data.description || '',
              category: res.data.category || 'Electrical',
              price: res.data.price || '',
              availability: res.data.availability || 'Available',
              location: res.data.location || '',
              latitude: res.data.latitude || '',
              longitude: res.data.longitude || ''
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Error loading service for edit');
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
      },
      (err) => alert('Could not get GPS location: ' + err.message)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.location) {
      setError('Please fill in title, description, category, price, and location.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined
      };

      if (isEditing) {
        await serviceApi.updateService(id, payload);
      } else {
        await serviceApi.createService(payload);
      }
      navigate('/provider/services');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading service details..." />;

  return (
    <div style={{ maxWidth: '720px' }}>
      <button
        onClick={() => navigate('/provider/services')}
        className="btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Services
      </button>

      <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {isEditing ? 'Edit Service Listing' : 'Create New Service Offering'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            Fill in the information for this service to publish it to local search
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Service Title
            </label>
            <input
              type="text"
              name="title"
              required
              className="form-input"
              placeholder="e.g. Complete Home Electrical Wiring & Inspection"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Service Rate (₹)
              </label>
              <input
                type="number"
                name="price"
                required
                min={0}
                className="form-input"
                placeholder="e.g. 499"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Service Description
            </label>
            <textarea
              name="description"
              required
              rows={4}
              className="form-input"
              placeholder="Describe what's included in this service, your tools, experience, warranty..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Service Location / City
              </label>
              <input
                type="text"
                name="location"
                required
                className="form-input"
                placeholder="e.g. Pune, MH"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Availability Schedule
              </label>
              <input
                type="text"
                name="availability"
                className="form-input"
                placeholder="e.g. Mon-Sat 9am to 7pm"
                value={formData.availability}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Optional GPS Coordinates */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                Hyperlocal GPS Coordinates (Optional)
              </span>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                <Navigation size={13} /> Detect My GPS
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                type="number"
                step="any"
                name="latitude"
                className="form-input"
                placeholder="Latitude (e.g. 18.5204)"
                value={formData.latitude}
                onChange={handleChange}
              />
              <input
                type="number"
                step="any"
                name="longitude"
                className="form-input"
                placeholder="Longitude (e.g. 73.8567)"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-emerald"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.98rem' }}
          >
            {submitting ? 'Saving Service...' : isEditing ? 'Update Service' : 'Publish Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
