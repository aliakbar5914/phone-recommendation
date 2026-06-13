/* Brand SVG icon paths — keyed by brand name (lowercase) */
const BRAND_ICONS = {
  apple:    '/apple.svg',
  samsung:  '/samsung.svg',
  google:   '/google.svg',
  oneplus:  '/oneplus.svg',
  xiaomi:   '/xiaomi.svg',
  motorola: '/motorola.svg',
  nothing:  '/nothing.svg',
  sony:'/sony.svg'
};

/**
 * Returns an <img> src if the brand has an SVG, otherwise returns null.
 * Usage: getBrandSvg('Apple') → '/apple.svg'
 */
export function getBrandSvg(brand) {
  if (!brand) return null;
  return BRAND_ICONS[brand.toLowerCase()] || null;
}

const brandColors = {
  Apple:    { bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)', text: '#f1f5f9', fallback: '🍎' },
  Samsung:  { bg: 'linear-gradient(135deg,#1428a0 0%,#0d47a1 100%)', text: '#e3f2fd', fallback: '📱' },
  OnePlus:  { bg: 'linear-gradient(135deg,#e53935 0%,#1a1a1a 100%)', text: '#fce4ec', fallback: '⚡' },
  Xiaomi:   { bg: 'linear-gradient(135deg,#ff6f00 0%,#e65100 100%)', text: '#fff3e0', fallback: '🔥' },
  Google:   { bg: 'linear-gradient(135deg,#4285f4 0%,#34a853 50%,#fbbc05 100%)', text: '#fff', fallback: '🔍' },
  Nothing:  { bg: 'linear-gradient(135deg,#111 0%,#2a2a2a 100%)', text: '#fff', fallback: '⚪' },
  Motorola: { bg: 'linear-gradient(135deg,#1b3a4b 0%,#065a82 100%)', text: '#e0f7fa', fallback: '🅜' },
  Sony:     { bg: 'linear-gradient(135deg,#1c1c1c 0%,#3a3a3a 100%)', text: '#e5e7eb', fallback: '🎵' },
  default:  { bg: 'linear-gradient(135deg,#374151 0%,#1f2937 100%)', text: '#e5e7eb', fallback: '📱' },
};

export function getBrandStyle(brand) {
  return brandColors[brand] || brandColors.default;
}

export function getBrandFallback(brand) {
  return (brandColors[brand] || brandColors.default).fallback;
}

export default brandColors;
