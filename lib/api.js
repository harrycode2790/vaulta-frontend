const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:46753';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',          // send/receive the authentication cookie
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  post: (path, body) => request('POST', path, body),
  get:  (path)       => request('GET',  path),
  put:  (path, body) => request('PUT',  path, body),
  patch:(path, body) => request('PATCH', path, body),
  del:  (path)       => request('DELETE', path),
};

// ── Duo Savings ───────────────────────────────────────────
export const duoSavingsApi = {
  getMyPlans:           ()                    => api.get('/api/duoSavings/my-plans'),
  create:               (body)                => api.post('/api/duoSavings/create-duo-savings', body),
  invite:               (duoSavingsId, body)  => api.post(`/api/duoSavings/invite-user/${duoSavingsId}`, body),
  getInvites:           ()                    => api.get('/api/duoSavings/invites'),
  acceptInvite:         (inviteId)            => api.patch(`/api/duoSavings/accept-invite/${inviteId}`),
  deposit:              (duoSavingsId, body)  => api.post(`/api/duoSavings/deposit/${duoSavingsId}`, body),
  getYield:             (planId)              => api.get(`/api/duoSavings/get-duo-savings-yield/${planId}`),
  getHistory:           (duoSavingsId)        => api.get(`/api/duoSavings/get-duo-savings-history/${duoSavingsId}`),
  requestWithdrawal:    (duoSavingsId, body)  => api.post(`/api/duoSavings/withdraw-from-duo-savings/${duoSavingsId}`, body),
  getPendingApprovals:  ()                    => api.get('/api/duoSavings/get-pending-duo-savings-withdrawal-approvals'),
  approveWithdrawal:    (requestId)           => api.patch(`/api/duoSavings/approve-duo-savings-withdrawal/${requestId}`),
  rejectWithdrawal:     (requestId)           => api.patch(`/api/duoSavings/reject-duo-savings-withdrawal/${requestId}`),
  getWithdrawalHistory: (duoSavingsId)        => api.get(`/api/duoSavings/duo-savings-withdrawaal-history/${duoSavingsId}`),
};

// ── Single Savings ────────────────────────────────────────
export const singleSavingsApi = {
  create:             (body)   => api.post('/api/singleSavings/create-single-savings', body),
  getHistory:         ()       => api.get('/api/singleSavings/get-single-savings-history'),
  getTotalYield:      (planId) => api.get(`/api/singleSavings/get-total-yield/${planId}`),
  withdraw:           (planId, body) => api.patch(`/api/singleSavings/withdraw-single-savings/${planId}`, body),
  getWithdrawalHistory: ()     => api.get('/api/singleSavings/single-savings-withdrawal-history'),
};

// ── Family Savings ────────────────────────────────────────
export const familySavingsApi = {
  getMyPlans:           ()              => api.get('/api/familySavings/my-plans'),
  create:               (body)          => api.post('/api/familySavings/create-family-savings', body),
  invite:               (planId, body)  => api.post(`/api/familySavings/invite-user/${planId}`, body),
  getInvites:           ()              => api.get('/api/familySavings/invites'),
  acceptInvite:         (inviteId)      => api.patch(`/api/familySavings/accept-invite/${inviteId}`),
  deposit:              (planId, body)  => api.post(`/api/familySavings/deposit/${planId}`, body),
  getYield:             (planId)        => api.get(`/api/familySavings/get-family-savings-yield/${planId}`),
  getPlanHistory:       (planId)        => api.get(`/api/familySavings/get-family-savings-history/${planId}`),
  requestWithdrawal:    (planId, body)  => api.post(`/api/familySavings/withdraw-from-family-savings/${planId}`, body),
  getPendingApprovals:  ()              => api.get('/api/familySavings/get-pending-family-savings-withdrawal-approvals'),
  approveWithdrawal:    (requestId)     => api.patch(`/api/familySavings/approve-family-savings-withdrawal/${requestId}`),
  rejectWithdrawal:     (requestId)     => api.patch(`/api/familySavings/reject-family-savings-withdrawal/${requestId}`),
  getWithdrawalHistory: (planId)        => api.get(`/api/familySavings/family-savings-withdrawal-history/${planId}`),
};

// ── Messages ──────────────────────────────────────────────
export const messagesApi = {
  send:    (body) => api.post('/api/messages/send-message', body),
  getAll:  ()     => api.get('/api/messages/get-messages'),
};

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register:            (body)     => api.post('/api/auth/register', body),
  verifyOtp:           (body)     => api.post('/api/auth/verify', body),
  login:               (body)     => api.post('/api/auth/login', body),
  logout:              ()         => api.post('/api/auth/logout'),
  forgotPassword:      (body)     => api.post('/api/auth/forgot-password', body),
  resetPassword:       (body)     => api.post('/api/auth/reset-password', body),
  getMe:               ()         => api.get('/api/auth/user'),
  getDashboardSummary: ()         => api.get('/api/auth/dashboard-summary'),
  findUser:            (username) => api.get(`/api/auth/find-user?username=${encodeURIComponent(username)}`),
};
