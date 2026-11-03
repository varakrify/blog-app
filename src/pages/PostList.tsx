import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, Post } from '../api';

function excerpt(text: string, length = 180) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading posts…</p>;
  if (error) return <p className="error">Could not load posts: {error}</p>;

  return (
    <>
      <h1>Latest posts</h1>
      {posts.length === 0 ? (
        <p className="muted">No posts yet. Sign up and write the first one.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <article key={post.id} className="card">
              {post.image_url && <img src={post.image_url} alt="" className="card-image" />}
              <h2>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="meta">
                {post.author_email || 'Unknown author'} · {formatDate(post.created_at)}
              </p>
              <p>{excerpt(post.content)}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
