import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditPost = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    coverImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [focused, setFocused] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!user) return;

    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);

        const authorId = data?.author?._id;

        if (
          authorId &&
          user._id &&
          authorId !== user._id &&
          user.role !== 'admin'
        ) {
          toast.error('Not authorized to edit this post');
          navigate('/');
          return;
        }

        setForm({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          category: data.category || 'Technology',
          coverImage: data.coverImage || '',
        });

      } catch (err) {
        toast.error(err.response?.data?.message || 'Post not found');
        navigate('/');
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/posts/${id}`, form);

      toast.success('Post updated successfully!');
      navigate(`/post/${id}`);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post');
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
    backgroundColor: '#fafafa',
    boxShadow:
      focused === name ? '0 0 0 4px rgba(233,69,96,0.08)' : 'none',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.45rem',
  };

  if (!user) return null;

  if (fetching) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '760px', margin: '0 auto' }}>

      <h2>Edit Post ✏️</h2>

      <form onSubmit={handleSubmit}>

        <label style={labelStyle}>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          style={inputStyle('title')}
        />

        <label style={labelStyle}>Excerpt</label>
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          style={inputStyle('excerpt')}
        />

        <label style={labelStyle}>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={inputStyle('category')}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label style={labelStyle}>Cover Image</label>
        <input
          name="coverImage"
          value={form.coverImage}
          onChange={handleChange}
          style={inputStyle('coverImage')}
        />

        <label style={labelStyle}>Content</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={10}
          style={inputStyle('content')}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '0.8rem',
            width: '100%',
            background: '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

      </form>
    </div>
  );
};

export default EditPost;