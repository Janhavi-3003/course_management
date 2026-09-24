// Small display/formatting helpers used across UI components — ES6 module (Task 5).

export const TAG_MAP_FALLBACK = 'tag-blue';

export function formatPrice(price) {
  return price === 0 ? 'FREE' : `₹${Number(price).toLocaleString('en-IN')}`;
}

export function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
  return Math.floor(diff / 86400) + ' day(s) ago';
}

/** Deterministic short verification code for a certificate. */
export function certId(email, courseId, completedAt) {
  const str = String(email) + '|' + String(courseId) + '|' + String(completedAt);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'CM-' + Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
}

export function initialsFor(fullName) {
  return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function partsLabel(state) {
  const n = (state.viewed ? 1 : 0) + (state.watched ? 1 : 0) + (state.read ? 1 : 0);
  if (n === 3) return { text: 'Completed', cls: 'pill-success' };
  if (n === 0) return { text: 'Not Started', cls: 'pill-muted' };
  return { text: `In Progress (${n}/3)`, cls: 'pill-warn' };
}
