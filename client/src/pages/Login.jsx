import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password.trim(),
      });

      if (!data) {
        toast.error('Invalid server response');
        return;
      }

      login(data);

      toast.success(`Welcome back, ${data.name || 'User'}!`);

      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
    backgroundColor: '#fafafa',
    boxShadow:
      focused === name ? '0 0 0 4px rgba(233,69,96,0.08)' : 'none',
    color: '#111',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{
            color: '#e94560',
            fontSize: '2rem',
            fontWeight: '800',
            textDecoration: 'none',
          }}>
            BlogSpace
          </Link>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
            Welcome back 👋
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              style={inputStyle('email')}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={{ ...inputStyle('password'), marginTop: '1rem' }}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.9rem',
                backgroundColor: loading ? '#f3a0ae' : '#e94560',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#e94560', fontWeight: '700' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;