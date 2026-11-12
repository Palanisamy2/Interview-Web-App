const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  candidateStart: (data: any) => apiRequest('/auth/candidate/start', { method: 'POST', body: JSON.stringify(data) }),
  adminLogin: (credentials: any) => apiRequest('/auth/admin/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Roles & Stacks
  getRoles: () => apiRequest('/roles'),
  getStacks: (roleId: number) => apiRequest(`/roles/${roleId}/stacks`),

  // Sessions
  createSession: (data: { roleId: number; stackId: number; candidateId: string }) =>
    apiRequest('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  startSession: (sessionId: string) =>
    apiRequest(`/sessions/${sessionId}/start`, { method: 'POST' }),
  getQuestions: (sessionId: string) =>
    apiRequest(`/sessions/${sessionId}/questions`),
  autosaveAnswer: (sessionId: string, questionId: number, data: any) =>
    apiRequest(`/sessions/${sessionId}/answers/${questionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  runCode: (sessionId: string, questionId: number, code: string) =>
    apiRequest(`/sessions/${sessionId}/run-code`, { method: 'POST', body: JSON.stringify({ questionId, code }) }),
  recordTelemetry: (sessionId: string, questionId: number, data: any) =>
    apiRequest(`/sessions/${sessionId}/telemetry/${questionId}`, { method: 'POST', body: JSON.stringify(data) }),
  logAuditEvent: (sessionId: string, eventType: string, meta: any = {}) =>
    apiRequest(`/sessions/${sessionId}/events`, { method: 'POST', body: JSON.stringify({ eventType, meta }) }),
  submitSession: (sessionId: string) =>
    apiRequest(`/sessions/${sessionId}/submit`, { method: 'POST' }),
  getSessionStatus: (sessionId: string) =>
    apiRequest(`/sessions/${sessionId}/status`),

  // Admin
  getDashboardStats: () => apiRequest('/admin/stats'),
  listCandidates: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiRequest(`/admin/candidates${query ? `?${query}` : ''}`);
  },
  getSessionReport: (sessionId: string) =>
    apiRequest(`/admin/sessions/${sessionId}/report`),
  createInvitation: (data: any) =>
    apiRequest('/admin/invitations', { method: 'POST', body: JSON.stringify(data) }),
  listQuestions: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiRequest(`/admin/questions${query ? `?${query}` : ''}`);
  },
  importQuestions: (questions: any[]) =>
    apiRequest('/admin/questions/import', { method: 'POST', body: JSON.stringify(questions) }),
  updateQuestionStatus: (id: number, status: string) =>
    apiRequest(`/admin/questions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

