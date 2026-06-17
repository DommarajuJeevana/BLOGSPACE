import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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
        api.get(`/posts/${id}`),
        api.get(`/comments/${id}`),
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
      await api.delete(`/posts/${id}`);
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

      const { data } = await api.post(`/comments/${id}`, {
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

      await api.delete(`/comments/${commentId}`);

      setComments(
        comments.filter((comment) => comment._id !== commentId)
      );

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

        {/* Author Info */}
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

        {/* Category */}
        <div className="mb-4">
          <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-500 leading-relaxed mb-8">
          {post.excerpt}
        </p>

        {/* Cover Image */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full rounded-xl mb-10 object-cover max-h-[500px]"
          />
        )}

        {/* Edit/Delete */}
        {(isOwner || isAdmin) && (
          <div className="flex gap-4 mb-10">
            {isOwner && (
              <button
                onClick={() => navigate(`/edit/${post._id}`)}
                className="px-5 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
              >
                Edit
              </button>
            )}

            <button
              onClick={handleDeletePost}
              className="px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        )}

        {/* Content */}
        <article className="prose prose-lg max-w-none text-gray-800">
          <div className="whitespace-pre-wrap leading-8">
            {post.content}
          </div>
        </article>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>
                {/* Comments */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Responses ({comments.length})
          </h2>

          {user ? (
            <form onSubmit={handleAddComment} className="mb-10">
              <textarea
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />

              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="mt-4 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50"
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="mb-10 p-6 bg-gray-50 rounded-xl">
              <p className="text-gray-600 mb-4">
                Sign in to join the discussion.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 bg-black text-white rounded-full"
              >
                Sign In
              </button>
            </div>
          )}

          <div className="space-y-8">
            {comments.length === 0 ? (
              <p className="text-gray-500">No responses yet.</p>
            ) : (
              comments.map((comment) => {
                const canDelete =
                  user &&
                  (comment.author?._id === user._id ||
                    user.role === "admin");

                return (
                  <div
                    key={comment._id}
                    className="border-b border-gray-200 pb-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {comment.author?.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() =>
                            handleDeleteComment(comment._id)
                          }
                          disabled={deletingComment === comment._id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingComment === comment._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </div>

                    <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-16">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-100 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SinglePost;