import { USERS, STAGE_META, day } from '../data/mock';

export const inr = (n) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};
export const inrFull = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

export const userName = (id) => USERS.find((u) => u.id === id)?.name || 'Unassigned';
export const firstName = (id) => userName(id).split(' ')[0];
export const initials = (name = '') => name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export const priorityOf = (score) => (score >= 75 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold');
export const PRIORITY_COLOR = { Hot: '#B91C1C', Warm: '#B45309', Cold: '#1D4ED8' };
export const stageColor = (s) => STAGE_META[s]?.color || '#6B7280';

export const TODAY = () => day(0);
export const isOpen = (lead) => !['Won', 'Lost'].includes(lead.stage);

export const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
export const relDay = (iso) => {
  if (!iso) return '—';
  const diff = Math.round((new Date(iso + 'T00:00:00') - new Date(day(0) + 'T00:00:00')) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Overdue 1d';
  if (diff < 0) return `Overdue ${-diff}d`;
  return fmtDate(iso);
};
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortToday = () => {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const longToday = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

export const toCSV = (rows) =>
  rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

export const downloadFile = (name, content, type = 'text/csv') => {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};
