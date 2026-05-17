// ── LinkOS API Client ──────────────────────────────────────────────
// Base URL: FastAPI backend running on port 8000

import { getToken, logout } from './auth';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Auth & Users ───────────────────────────────────────────────────
export const listUsers    = () => req('/auth/users');
export const registerUser = (body) => req('/auth/register', { method: 'POST', body: JSON.stringify(body) });
export const deleteUser   = (username) => req(`/auth/users/${username}`, { method: 'DELETE' });

async function req(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired or invalid — force logout
    logout();
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── System ─────────────────────────────────────────────────────────
export const getHealth = () => req('/health');
export const getStats  = () => req('/stats');

// ── Entities ───────────────────────────────────────────────────────
export const getMentors     = () => req('/entities/mentors');
export const getMentor      = (id) => req(`/entities/mentors/${id}`);
export const createMentor   = (body) => req('/entities/mentors', { method: 'POST', body: JSON.stringify(body) });

export const getCompanies   = () => req('/entities/companies');
export const getCompany     = (id) => req(`/entities/companies/${id}`);
export const createCompany  = (body) => req('/entities/companies', { method: 'POST', body: JSON.stringify(body) });

export const getProgrammes  = () => req('/entities/programmes');
export const getProgramme   = (id) => req(`/entities/programmes/${id}`);
export const createProgramme= (body) => req('/entities/programmes', { method: 'POST', body: JSON.stringify(body) });

export const getPartners    = () => req('/entities/partners');

// ── Linkages ───────────────────────────────────────────────────────
export const getLinkages    = (filters = {}) => {
  const qs = new URLSearchParams(filters).toString();
  return req(`/linkages/${qs ? `?${qs}` : ''}`);
};
export const confirmLinkage = (id) => req(`/linkages/${id}/confirm`, { method: 'POST' });
export const closeLinkage   = (id, outcome = 'completed', rating = 5.0) =>
  req(`/linkages/${id}/close?outcome=${outcome}&final_rating=${rating}`, { method: 'POST' });
export const logSession     = (id, body) =>
  req(`/linkages/${id}/log-session`, { method: 'POST', body: JSON.stringify(body) });
export const getSessions    = (id) => req(`/linkages/${id}/sessions`);
export const flagLinkage    = (id) => req(`/linkages/${id}/flag`, { method: 'POST' });
export const getTrajectory  = (id) => req(`/linkages/${id}/trajectory`);
export const getSuggestions = (programme_id) => req(`/linkages/suggestions?programme_id=${programme_id}`);

// ── Match ──────────────────────────────────────────────────────────
export const runMatch = (body) => req('/match/run', { method: 'POST', body: JSON.stringify(body) });

// ── SSE Streaming ──────────────────────────────────────────────────
/**
 * Build the SSE URL with token auth (EventSource can't send headers).
 */
function getStreamUrl(path) {
  const token = getToken();
  const url = `${BASE}${path}`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

/**
 * Open an SSE stream for live Gemini reasoning logs.
 * @param {(line: string) => void} onLine  callback for each line
 * @param {() => void}             onDone  called when stream closes
 * @returns {() => void}                   cleanup function
 */
export function streamReasoning(onLine, onDone) {
  const url = getStreamUrl('/stream/reasoning');
  const es = new EventSource(url);

  es.onmessage = (e) => onLine(e.data);
  es.onerror   = () => { es.close(); onDone?.(); };
  es.addEventListener('done', () => { es.close(); onDone?.(); });

  return () => es.close();
}
