import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, Comment, formatDate, Post } from '../api';
import { useAuth } from '../auth';

export default function PostDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPost(id), api.listComments(id)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const canManage = (ownerId: string | null) =>
    !!user && (user.id === ownerId || user.role === 'admin');

  async function handleDeletePost() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.deletePost(id);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setCommentError('');
    try {
      const comment = await api.addComment(id, newComment);
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setCommentError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setCommentError((err as Error).message);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (error || !post) return <p className="error">{error || 'Post not found'}</p>;

  return (
    <article>
      <p>
        <Link to="/">← All posts</Link>
      </p>
      {post.image_url && <img src={post.image_url} alt="" className="hero-image" />}
      <h1>{post.title}</h1>
      <p className="meta">
        {post.author_email || 'Unknown author'} · {formatDate(post.created_at)}
      </p>
      {post.tags && post.tags.length > 0 && (
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {canManage(post.author_id) && (
        <div className="actions">
          <Link to={`/posts/${post.id}/edit`} className="btn">
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDeletePost}>
            Delete
          </button>
        </div>
      )}

      <div className="post-content">{post.content}</div>

      <section className="comments">
        <h2>Comments ({comments.length})</h2>
        {comments.length === 0 && <p className="muted">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <p className="meta">
              {c.author_email || 'Unknown'} · {formatDate(c.created_at)}
              {canManage(c.user_id) && (
                <button className="link-button" onClick={() => handleDeleteComment(c.id)}>
                  Delete
                </button>
              )}
            </p>
            <p>{c.content}</p>
          </div>
        ))}

        {user ? (
          <form onSubmit={handleAddComment} className="form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
            />
            {commentError && <p className="error">{commentError}</p>}
            <button className="btn btn-primary" disabled={submitting || !newComment.trim()}>
              {submitting ? 'Posting…' : 'Add comment'}
            </button>
          </form>
        ) : (
          <p className="muted">
            <Link to="/login">Log in</Link> to comment.
          </p>
        )}
      </section>
    </article>
  );
}
