const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401 && typeof window !== 'undefined') { localStorage.clear(); window.location.href = '/login'; }
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: res.statusText })); throw new Error(err.detail || 'Request failed'); }
  return res.json();
}

export const auth = {
  register: (data: any) => request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) => request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/api/v1/auth/me'),
  refresh: (token: string) => request('/api/v1/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }),
};

export const business = {
  getProfile: () => request('/api/v1/business/profile'),
  updateProfile: (data: any) => request('/api/v1/business/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getStats: () => request('/api/v1/business/stats'),
};

export const support = {
  chat: (data: { message: string; conversation_id?: string; language?: string }) => request('/api/v1/support/chat', { method: 'POST', body: JSON.stringify(data) }),
  getConversations: (params?: string) => request(`/api/v1/support/conversations${params ? '?' + params : ''}`),
  getConversation: (id: string) => request(`/api/v1/support/conversations/${id}`),
  escalate: (id: string) => request(`/api/v1/support/conversations/${id}/escalate`, { method: 'POST' }),
  assign: (id: string, agent_id: string) => request(`/api/v1/support/conversations/${id}/assign`, { method: 'POST', body: JSON.stringify({ agent_id }) }),
  widgetConfig: () => request('/api/v1/support/widget-config'),
};

export const tickets = {
  list: (params?: string) => request(`/api/v1/tickets${params ? '?' + params : ''}`),
  get: (id: string) => request(`/api/v1/tickets/${id}`),
  create: (data: any) => request('/api/v1/tickets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/v1/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const appointments = {
  getSlots: (data: any) => request('/api/v1/appointments/slots', { method: 'POST', body: JSON.stringify(data) }),
  create: (data: any) => request('/api/v1/appointments', { method: 'POST', body: JSON.stringify(data) }),
  list: (params?: string) => request(`/api/v1/appointments${params ? '?' + params : ''}`),
  update: (id: string, data: any) => request(`/api/v1/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const orders = {
  list: (params?: string) => request(`/api/v1/orders${params ? '?' + params : ''}`),
  get: (id: string) => request(`/api/v1/orders/${id}`),
  create: (data: any) => request('/api/v1/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => request(`/api/v1/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getInvoice: (id: string) => request(`/api/v1/orders/${id}/invoice`),
};

export const products = {
  list: (params?: string) => request(`/api/v1/products${params ? '?' + params : ''}`),
  create: (data: any) => request('/api/v1/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/v1/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const knowledge = {
  upload: (formData: FormData) => fetch(`${API_BASE}/api/v1/knowledge/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } as any, body: formData }).then(r => r.json()),
  list: (params?: string) => request(`/api/v1/knowledge/documents${params ? '?' + params : ''}`),
  delete: (id: string) => request(`/api/v1/knowledge/documents/${id}`, { method: 'DELETE' }),
  search: (query: string) => request('/api/v1/knowledge/search', { method: 'POST', body: JSON.stringify({ query }) }),
};

export const analytics = {
  overview: () => request('/api/v1/analytics/overview'),
  conversations: () => request('/api/v1/analytics/conversations'),
  satisfaction: () => request('/api/v1/analytics/satisfaction'),
  topics: () => request('/api/v1/analytics/topics'),
  opportunities: () => request('/api/v1/analytics/opportunities'),
};
