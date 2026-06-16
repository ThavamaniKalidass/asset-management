const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  return localStorage.getItem('ams_token');
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    if (response.status === 401) {
      localStorage.removeItem('ams_token');
      localStorage.removeItem('ams_auth');
      window.location.href = '/login';
    }
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  me: () => request<{ id: string; email: string; name: string; role: string; created_at: string }>('/api/auth/me'),
};

// Assets API
export const assetsApi = {
  getAll: (params?: Record<string, string>) => {
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ assets: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/assets${searchParams}`
    );
  },
  getById: (id: string) => request<any>(`/api/assets/${id}`),
  getStats: () => request<any>('/api/assets/stats'),
  getDesks: () => request<string[]>('/api/assets/desks'),
  getByDesk: (deskNumber: string) =>
    request<{ desk_number: string; assets: any[] }>(`/api/assets/desk/${encodeURIComponent(deskNumber)}`),
  getRecent: (limit: number = 5) => request<any[]>(`/api/assets/recent?limit=${limit}`),
  create: (data: any) =>
    request<any>('/api/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/api/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/api/assets/${id}`, { method: 'DELETE' }),
  bulkImport: (assets: any[]) =>
    request<{ imported: number; assets: any[] }>('/api/assets/bulk', {
      method: 'POST',
      body: JSON.stringify({ assets }),
    }),
  getQR: (deskNumber: string) =>
    request<any>(`/api/assets/qr/${encodeURIComponent(deskNumber)}`),
};

export default request;
