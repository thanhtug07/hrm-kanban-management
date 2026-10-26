const PASTEL_PALETTE = [
  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // Blue
  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, // Green
  { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' }, // Purple
  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' }, // Orange
  { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' }, // Pink
  { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' }, // Teal
  { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' }, // Yellow
];

export function getInitials(name?: string): string {
  if (!name) return 'NV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarStyle(name?: string) {
  if (!name) return PASTEL_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTE.length;
  return PASTEL_PALETTE[index];
}
