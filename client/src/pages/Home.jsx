import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const categories = [
  'All',
  'Technology',
  'Travel',
  'Food',
  'Health',
  'Business',
  'Lifestyle',
  'Education',
  'Other'
];

const getAvatar = (name) => name?.charAt(0).toUpperCase() || '?';

const readTime = (content) => {
  const words = content?.trim()?.split(/\s+/)?.length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // FETCH POSTS
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.log('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // FILTER LOGIC
  useEffect(() => {
    let result = [...posts];

    // category filter
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // search filter
    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(p => {
        const title = p.title?.toLowerCase() || '';
        const cat = p.category?.toLowerCase() || '';
        const author = p.author?.name?.toLowerCase() || '';

        return (
          title.includes(q) ||
          cat.includes(q) ||
          author.includes(q)
        );
      });
    }

    setFiltered(result);
  }, [search, category, posts]);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Ideas worth sharing
        </h1>

        <p style={{ opacity: 0.8 }}>
          Discover blogs, stories, and insights
        </p>

        {/* SEARCH BAR */}
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, categories, authors..."
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '0.9rem 1rem',
              borderRadius: '50px',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '1rem',
        background: '#fff',
        gap: '10px'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: category === cat ? '2px solid #e94560' : '1px solid #ddd',
              background: category === cat ? '#ffe6ea' : '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No posts found</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {filtered.map(post => (
              <div
                key={post._id}
                onClick={() => navigate(`/post/${post._id}`)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                  transition: '0.2s'
                }}
              >

                {/* IMAGE */}
                <img
                  src={
                    post.coverImage ||
                    `https://source.unsplash.com/800x400/?${post.category || 'blog'}`
                  }
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />

                {/* CONTENT */}
                <div style={{ padding: '1rem' }}>
                  <h3>{post.title}</h3>
                  <p style={{ color: '#555' }}>
                    {post.excerpt || post.content?.slice(0, 100) + '...'}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#777',
                    marginTop: '10px'
                  }}>
                    <span>{post.author?.name}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;