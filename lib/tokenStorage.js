const USER_KEY = 'vaulta_token';
const ADMIN_KEY = 'vaulta_admin_token';

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, value); } catch { /* ignore (private mode, storage disabled, etc.) */ }
}
function safeRemove(key) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export const userToken = {
  get:   ()      => safeGet(USER_KEY),
  set:   (token) => safeSet(USER_KEY, token),
  clear: ()      => safeRemove(USER_KEY),
};

export const adminToken = {
  get:   ()      => safeGet(ADMIN_KEY),
  set:   (token) => safeSet(ADMIN_KEY, token),
  clear: ()      => safeRemove(ADMIN_KEY),
};
