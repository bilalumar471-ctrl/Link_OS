// ── LinkOS Auth Service ─────────────────────────────────────────────
// Manages JWT token lifecycle and user state in localStorage.

const TOKEN_KEY = 'linkos_token';
const USER_KEY  = 'linkos_user';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Authenticate against the backend and store the JWT + user info.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Login failed (HTTP ${res.status})`);
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return { user: data.user, token: data.access_token };
}

/**
 * Clear auth state and redirect to login.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
}

/**
 * Get the stored JWT token (or null).
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the stored user object (or null).
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Check if the user has a valid (non-expired) token.
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT payload (middle segment) to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      // Token expired — clean up
      logout();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the current user has one of the allowed roles.
 * @param  {...string} roles
 * @returns {boolean}
 */
export function hasRole(...roles) {
  const user = getUser();
  return user ? roles.includes(user.role) : false;
}
