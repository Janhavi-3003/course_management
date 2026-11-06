// Formatting + small helpers used across pages
export const ymd = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const lastNDays = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });

// [{date, label, hours}] for the last n days (missing days = 0)
export const dailyHours = (activity, n) => {
  const map = new Map((activity || []).map((a) => [a.date, a.hours]));
  return lastNDays(n).map((d) => ({
    date: ymd(d),
    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
    day: d.getDate(),
    hours: map.get(ymd(d)) || 0,
  }));
};

export const totalHours = (activity) => +(activity || []).reduce((s, a) => s + a.hours, 0).toFixed(1);

// consecutive learning days up to today (or yesterday)
export const streak = (activity) => {
  const days = new Set((activity || []).filter((a) => a.hours > 0).map((a) => a.date));
  const d = new Date();
  if (!days.has(ymd(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(ymd(d))) { n += 1; d.setDate(d.getDate() - 1); }
  return n;
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export const formatPrice = (p) => (!p ? 'FREE' : `₹${Number(p).toLocaleString('en-IN')}`);

export const timeAgo = (iso) => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  if (s < 172800) return 'Yesterday';
  return `${Math.floor(s / 86400)} days ago`;
};

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export const dayLabel = (iso) => {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  const w = Math.floor(diff / 7);
  return `${w} week${w > 1 ? 's' : ''} ago`;
};

export const statusPill = (status) =>
  status === 'Completed' ? 'pill-success' : status === 'Almost Done' ? 'pill-warn' : status === 'In Progress' ? 'pill-primary' : '';

const CATS = {
  'Web Development': { tag: 'tag-blue', bg: '#EEF2FF', fill: '' },
  'Data Science': { tag: 'tag-green', bg: '#F0FDF4', fill: 'green' },
  Design: { tag: 'tag-orange', bg: '#FFF7ED', fill: 'orange' },
  Cloud: { tag: 'tag-blue', bg: '#E8F1FB', fill: '' },
  Mobile: { tag: 'tag-purple', bg: '#F3F0FF', fill: 'purple' },
  Database: { tag: 'tag-warn', bg: '#FEF7E0', fill: 'orange' },
};
export const catStyle = (c) => CATS[c] || { tag: 'tag-purple', bg: '#F3F0FF', fill: 'purple' };

export const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Cloud', 'Mobile', 'Database'];
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U';

export const notifIcon = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('certificate')) return '🏆';
  if (t.includes('completed')) return '🎉';
  if (t.includes('new course')) return '📚';
  if (t.includes('streak')) return '🔥';
  if (t.includes('enrolled')) return '✅';
  if (t.includes('message')) return '💬';
  if (t.includes('reminder')) return '💡';
  if (t.includes('welcome')) return '👋';
  return '🔔';
};

// Friendly message for any API error (incl. "backend not running")
export const errMsg = (e) => {
  if (e?.response) {
    const data = e.response.data || {};
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map((x) => (typeof x === 'string' ? x : x.message)).join(' ');
    }
    return data.message || `Request failed (${e.response.status}).`;
  }
  if (e?.code === 'ERR_NETWORK' || e?.request) {
    return 'Cannot reach the server. Make sure the backend is running (npm run dev) and the API URL is correct.';
  }
  return e?.message || 'Something went wrong.';
};

// Module content for courses created in mock mode (the real backend generates its own)
export const generateModules = (title, totalLessons, count = 3) => {
  const names = ['Introduction', 'Core Concepts', 'Hands-on Practice', 'Advanced Topics', 'Final Project'];
  const icons = ['🚀', '📘', '🛠️', '🧠', '🏁'];
  const base = Math.floor(Math.max(totalLessons, count) / count);
  const extra = Math.max(totalLessons, count) % count;
  return Array.from({ length: count }, (_, k) => ({
    moduleId: `m${k + 1}`,
    title: `Module ${k + 1}: ${names[k % names.length]}`,
    lessons: base + (k < extra ? 1 : 0),
    icon: icons[k % icons.length],
    videoMinutes: 10,
    theory: [
      `${names[k % names.length]} is a key stage of ${title}. This module introduces the ideas you need before moving on.`,
      'Read through the key ideas, make short notes in your own words, then try a small exercise of your own.',
      'When you are comfortable with the topic, mark the module as read to continue.',
    ],
  }));
};
