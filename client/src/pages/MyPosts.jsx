import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const readTime = (content) =>
  Math.max(1, Math.ceil((content?.split(' ').length || 0) / 200));

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchMyPosts = async () => {
      try {
        const { data } = await api.get('/posts/user/myposts'); // ✅ correct
        setPosts(data || []);
      } catch (err) {
        toast.error('Failed to load your posts');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

  const handleDelete = async (postId, e) => {
    e.stopPropagation();

    if (!window.confirm('Delete this post permanently?')) return;

    setDeletingId(postId);

    try {
      await api.delete(`/posts/${postId}`);

      setPosts(prev => prev.filter(p => p._id !== postId));

      toast.success('Post deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (postId, e) => {
    e.stopPropagation();
    navigate(`/edit/${postId}`);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Loading your stories...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h2>{user?.name}'s Posts</h2>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => navigate(`/post/${post._id}`)}
              style={{
                padding: '1rem',
                border: '1px solid #eee',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <h3>{post.title}</h3>

              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                {post.category} • {readTime(post.content)} min read •{' '}
                {formatDate(post.createdAt)}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={(e) => handleEdit(post._id, e)}>
                  Edit
                </button>

                <button
                  onClick={(e) => handleDelete(post._id, e)}
                  disabled={deletingId === post._id}
                >
                  {deletingId === post._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;