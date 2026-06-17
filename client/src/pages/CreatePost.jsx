import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Technology',
  'Travel',
  'Food',
  'Health',
  'Business',
  'Lifestyle',
  'Education',
  'Other'
];

const CreatePost = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    coverImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ FIX: safe redirect (NOT inside render)
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.content || !form.excerpt || !form.category) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/posts', form);

      toast.success('Post published successfully!');

      // ✅ safer navigation (handles different backend responses)
      const postId = data?._id || data?.post?._id;

      navigate(`/post/${postId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: `2px solid ${focused === name ? '#e94560' : '#e5e7eb'}`,
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
    boxShadow:
      focused === name ? '0 0 0 4px rgba(233,69,96,0.08)' : 'none',
    color: '#111',
    fontFamily: "'Segoe UI', sans-serif",
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.45rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}
          >
            ← Back
          </button>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>
            Write a new story ✍️
          </h1>

          <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>
            Share your ideas with the world
          </p>
        </div>

        {/* Form */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}>
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={labelStyle}>Post Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused('')}
                style={{ ...inputStyle('title'), fontSize: '1.1rem', fontWeight: '600' }}
              />
            </div>

            {/* Excerpt */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={labelStyle}>Short Excerpt *</label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                onFocus={() => setFocused('excerpt')}
                onBlur={() => setFocused('')}
                style={inputStyle('excerpt')}
              />
            </div>

            {/* Category + Image */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  onFocus={() => setFocused('category')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('category')}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Cover Image URL</label>
                <input
                  type="url"
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  onFocus={() => setFocused('coverImage')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('coverImage')}
                />
              </div>
            </div>

            {/* Content */}
            <div style={{ marginTop: '1.4rem', marginBottom: '2rem' }}>
              <label style={labelStyle}>Full Content *</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={12}
                onFocus={() => setFocused('content')}
                onBlur={() => setFocused('')}
                style={inputStyle('content')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: loading ? '#f3a0ae' : '#e94560',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Publishing...' : '🚀 Publish Story'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CreatePost;