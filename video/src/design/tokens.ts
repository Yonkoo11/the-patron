export const COLORS = {
  bg: '#0a0a0a',
  surface: '#141414',
  border: '#1f1f1f',
  borderHover: '#2a2a2a',
  textPrimary: '#f0f0f0',
  textSecondary: '#888888',
  textTertiary: '#555555',
  accentGreen: '#00ff88',
  accentBlue: '#3b82f6',
  accentAmber: '#f59e0b',
  accentRed: '#ef4444',
  greenGlow: 'rgba(0,255,136,0.4)',
  greenGlowSoft: 'rgba(0,255,136,0.15)',
  glassBg: 'rgba(20,20,20,0.85)',
  glassBorder: 'rgba(255,255,255,0.06)',
} as const;

export const FONTS = {
  heading: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const ADDRESSES = {
  treasury: '0xb5C65e983e013ea2249EB8Fc44A316C641c21c38',
  patron: '0x15545100bf579a5a6492499126E2b076a6890b98',
} as const;

export const STATS = {
  grantsIssued: 8,
  roundsCompleted: 6,
  treasuryBalance: '0.0540',
  totalDisbursed: '0.0036',
} as const;

export const GRANTS = [
  { address: '0xe3c9...dd1b', score: 62, amount: '0.000325', color: '#00ff88' },
  { address: '0x6584...6400', score: 45, amount: '0.000246', color: '#f59e0b' },
  { address: '0xafbc...1405', score: 40, amount: '0.000223', color: '#f59e0b' },
] as const;
