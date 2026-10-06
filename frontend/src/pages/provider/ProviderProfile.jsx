import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { providerApi } from '../../services/providerApi';
import RatingStars from '../../components/RatingStars';
import { User, Phone, MapPin, Award, ShieldCheck, CheckCircle, AlertCircle, Save, LogOut } from 'lucide-react';

const ProviderProfile = () => {
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    experience: user?.experience || '',
    serviceCategories: Array.isArray(user?.serviceCategories)
      ? user.serviceCategories.join(', ')
      : user?.serviceCategories || ''
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        experience: formData.experience ? Number(formData.experience) : undefined,
        serviceCategories: formData.serviceCategories
          ? formData.serviceCategories.split(',').map((c) => c.trim()).filter(Boolean)
          : []
      };

      const userId = user?._id || user?.id;
      const res = await providerApi.updateProvider(userId, payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Provider Business Profile
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Update your public profile, business specialties, and contact details
        </p>
      </div>

      <div className="glass-panel-static" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
        {/* Header Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{user?.name}</h2>
                {user?.isVerified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.74rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                    <ShieldCheck size={13} /> Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <RatingStars rating={user?.rating || 5} reviewsCount={user?.numReviews || 0} size={15} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', color: '#065f46', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
            <CheckCircle size={16} /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Business / Provider Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Service Base City / Location
              </label>
              <input
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Years of Experience
              </label>
              <input
                type="number"
                name="experience"
                min={0}
                className="form-input"
                placeholder="e.g. 5"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Service Categories (comma-separated)
              </label>
              <input
                type="text"
                name="serviceCategories"
                className="form-input"
                placeholder="e.g. Electrical, Plumbing, AC Repair"
                value={formData.serviceCategories}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Professional Bio & Qualifications
            </label>
            <textarea
              rows={4}
              name="bio"
              className="form-input"
              placeholder="Tell customers about your expertise, background checks, and commitment to quality..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-emerald"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.98rem' }}
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      <div>
        <button
          onClick={logout}
          className="btn-danger"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
        >
          <LogOut size={16} /> Log Out of Provider Account
        </button>
      </div>
    </div>
  );
};

export default ProviderProfile;
