export type Mode = 'light' | 'dark';

const light = {
  primary: '#004B8D', accent: '#38BDF8', bg: '#F3F5F8', card: '#FFFFFF', text: '#1B2430',
  muted: '#6B7684', border: '#E1E6EC', danger: '#C62828', warn: '#F9A825', ok: '#2E7D32',
  chip: '#EEF2F6', tint: '#E3F2FD', tintSoft: '#F0F7FF', dangerBg: '#FDE8E8', okBg: '#E3F4E5',
  warnBg: '#FFF3CD', infoBg: '#CDEBFB', warnFg: '#8A6D00', pink: '#C2185B', pinkBg: '#FCE4EC',
  placeholder: '#9AA5B1',
};

const dark: typeof light = {
  primary: '#4C9BF0', accent: '#38BDF8', bg: '#0F141A', card: '#1A222C', text: '#E8EDF3',
  muted: '#9AA7B5', border: '#2C3846', danger: '#EF5350', warn: '#FFB300', ok: '#66BB6A',
  chip: '#2A3441', tint: '#16324F', tintSoft: '#1B2D42', dangerBg: '#3A1F22', okBg: '#1D3322',
  warnBg: '#3A3118', infoBg: '#16324F', warnFg: '#FFD54F', pink: '#F48FB1', pinkBg: '#3B1F2B',
  placeholder: '#6B7684',
};

export const palettes = { light, dark };
export type Colors = typeof light;
export const radius = 12;
