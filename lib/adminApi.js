const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:46753';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

const r = {
  post:   (path, body) => request('POST',   path, body),
  get:    (path)       => request('GET',    path),
  patch:  (path, body) => request('PATCH',  path, body),
  del:    (path)       => request('DELETE', path),
};

export const adminApi = {
  login:              (body)                   => r.post('/api/admin/login', body),
  register:           (body)                   => r.post('/api/admin/register', body),
  getUsers:           (qs = '')                => r.get(`/api/admin/list-all-users${qs}`),
  deleteUser:         (userId)                 => r.del(`/api/admin/delete-user-by-admin/${userId}`),
  getSavings:         (qs = '')                => r.get(`/api/admin/list-all-savings-by-admin${qs}`),
  deleteSavings:      (type, id)               => r.del(`/api/admin/delete-savings-by-admin/${type}/${id}`),
  getReports:         ()                       => r.get('/api/admin/get-all-reports-by-admin'),
  respondToReport:    (id, body)               => r.patch(`/api/admin/respond-to-report/${id}`, body),
  deleteReport:       (id)                     => r.del(`/api/admin/delete-report-by-admin/${id}`),
  getConversations:   ()                       => r.get('/api/admin/get-all-conversations'),
  replyToConversation:(conversationId, body)   => r.post(`/api/admin/admin-reply/${conversationId}`, body),
  getUserSavings:     (userId)                 => r.get(`/api/admin/get-user-savings-by-admin/${userId}`),
  approveSavingsPlan:      (type, id) => r.patch(`/api/admin/approve-savings-plan/${type}/${id}`),
  rejectSavingsPlan:       (type, id) => r.patch(`/api/admin/reject-savings-plan/${type}/${id}`),
  approveDeposit:          (type, id) => r.patch(`/api/admin/approve-deposit/${type}/${id}`),
  rejectDeposit:           (type, id) => r.patch(`/api/admin/reject-deposit/${type}/${id}`),
  approveSingleWithdrawal: (id)       => r.patch(`/api/admin/approve-single-savings-withdrawal/${id}`),
  rejectSingleWithdrawal:  (id)       => r.patch(`/api/admin/reject-single-savings-withdrawal/${id}`),
};
