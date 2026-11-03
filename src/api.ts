export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'blog_token';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  image_url: string | null;
  author_id: string | null;
  author_email: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string | null;
  author_email: string | null;
  created_at: string;
}

export interface PostInput {
  title: string;
  content: string;
  tags: string;
  image_url: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (e.g. private mode); the session just won't persist
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request<User>('/auth/me'),

  listPosts: () => request<Post[]>('/posts'),
  getPost: (id: string) => request<Post>(`/posts/${id}`),
  createPost: (input: PostInput) => request<Post>('/posts', { method: 'POST', body: input }),
  updatePost: (id: string, input: PostInput) =>
    request<Post>(`/posts/${id}`, { method: 'PUT', body: input }),
  deletePost: (id: string) => request<void>(`/posts/${id}`, { method: 'DELETE' }),

  listComments: (postId: string) => request<Comment[]>(`/posts/${postId}/comments`),
  addComment: (postId: string, content: string) =>
    request<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: { content } }),
  deleteComment: (id: string) => request<void>(`/comments/${id}`, { method: 'DELETE' }),
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
