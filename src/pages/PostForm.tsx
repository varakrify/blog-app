import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, PostInput } from '../api';

const EMPTY: PostInput = { title: '', content: '', tags: '', image_url: '' };

// Used for both /new and /posts/:id/edit
export default function PostForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<PostInput>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .getPost(id)
      .then((post) =>
        setForm({
          title: post.title,
          content: post.content,
          tags: (post.tags || []).join(', '),
          image_url: post.image_url || '',
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field: keyof PostInput) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const post = id ? await api.updatePost(id, form) : await api.createPost(form);
      navigate(`/posts/${post.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>{isEdit ? 'Edit post' : 'New post'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Title
          <input value={form.title} onChange={update('title')} required />
        </label>
        <label>
          Content
          <textarea value={form.content} onChange={update('content')} rows={12} required />
        </label>
        <label>
          Tags <span className="muted">(comma separated)</span>
          <input value={form.tags} onChange={update('tags')} placeholder="react, node" />
        </label>
        <label>
          Image URL <span className="muted">(optional)</span>
          <input
            type="url"
            value={form.image_url}
            onChange={update('image_url')}
            placeholder="https://…"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
