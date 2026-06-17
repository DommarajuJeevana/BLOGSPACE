import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const readTime = (content) => {
  const words = content?.split(" ").length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);

      const [postRes, commentsRes] = await Promise.all([
        api.get(`/api/posts/${id}`),
        api.get(`/api/comments/${id}`),
      ]);

      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      toast.error("Post not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/api/posts/${id}`);
      toast.success("Post deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);

      const { data } = await api.post(`/api/comments/${id}`, {
        content: newComment,
      });

      setComments([data, ...comments]);
      setNewComment("");

      toast.success("Comment added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      setDeletingComment(commentId);

      await api.delete(`/api/comments/${commentId}`);

      setComments(comments.filter((c) => c._id !== commentId));

      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingComment(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Loading post...
        </h2>
      </div>
    );
  }

  if (!post) return null;

  const isOwner = user && post.author?._id === user._id;
  const isAdmin = user && user.role === "admin";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
            {post.author?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {post.author?.name}
            </p>

            <p className="text-sm text-gray-500">
              {formatDate(post.createdAt)} · {readTime(post.content)} min read
            </p>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {post.category}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

        <p className="text-xl text-gray-500 mb-8">{post.excerpt}</p>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full rounded-xl mb-10"
          />
        )}

        {(isOwner || isAdmin) && (
          <div className="flex gap-4 mb-10">
            {isOwner && (
              <button
                onClick={() => navigate(`/edit/${post._id}`)}
                className="px-5 py-2 border rounded-full"
              >
                Edit
              </button>
            )}

            <button
              onClick={handleDeletePost}
              className="px-5 py-2 bg-red-600 text-white rounded-full"
            >
              Delete
            </button>
          </div>
        )}

        <div className="whitespace-pre-wrap leading-8 mb-10">
          {post.content}
        </div>

        <hr />

        <h2 className="text-2xl font-bold mt-10 mb-6">
          Responses ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleAddComment}>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border p-3 rounded-xl"
              placeholder="Write comment..."
            />

            <button
              type="submit"
              disabled={commentLoading}
              className="mt-3 px-6 py-2 bg-black text-white rounded-full"
            >
              {commentLoading ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <button onClick={() => navigate("/login")}>
            Sign in to comment
          </button>
        )}

        <div className="mt-8 space-y-6">
          {comments.map((c) => {
            const canDelete =
              user &&
              (c.author?._id === user._id || user.role === "admin");

            return (
              <div key={c._id} className="border-b pb-4">
                <div className="flex justify-between">
                  <p className="font-semibold">{c.author?.name}</p>

                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      {deletingComment === c._id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>

                <p className="text-gray-700">{c.content}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-10 px-5 py-2 border rounded-full"
        >
          Back
        </button>

      </div>
    </div>
  );
};

export default SinglePost;