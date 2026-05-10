import { auth } from '../firebase/config.js';

const SERVER = import.meta.env.VITE_AI_SERVER_URL || import.meta.env.VITE_PDF_SERVER_URL || 'http://localhost:3001';

const FRIENDLY = {
  429: 'AI is temporarily busy. Please try again in a moment.',
  503: 'AI is not available right now. Please try again later.',
  502: 'AI generation failed. Please try again.',
};

function friendlyError(data, status) {
  return data?.error || FRIENDLY[status] || 'Something went wrong. Please try again.';
}

async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export async function fetchInterviewQuestion({ category, role, skills = [], context = '' }) {
  const headers = { 'Content-Type': 'application/json', ...await getAuthHeader() };
  const res = await fetch(`${SERVER}/api/ai-interview`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ category, role, skills, context }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 403) {
    const err = new Error(data?.error || 'Upgrade to Pro to unlock AI Interview Simulator.');
    err.code = 'PREMIUM_REQUIRED';
    throw err;
  }
  if (!res.ok) throw new Error(friendlyError(data, res.status));
  return data; // { question, hint, answer }
}

export async function fetchAISummary({ role, skills = [], experience = [], education = [] }) {
  const headers = { 'Content-Type': 'application/json', ...await getAuthHeader() };
  const res = await fetch(`${SERVER}/api/ai-summary`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ role, skills, experience, education }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 403) {
    const err = new Error(data?.error || 'Upgrade to Pro to unlock AI Summary Generator.');
    err.code = 'PREMIUM_REQUIRED';
    throw err;
  }
  if (!res.ok) throw new Error(friendlyError(data, res.status));
  return data; // { summary }
}
