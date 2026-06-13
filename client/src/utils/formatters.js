export function formatPrice(priceApprox, priceText) {
  if (priceText) return priceText.split('/')[0].trim();
  if (priceApprox) return `~$${priceApprox}`;
  return 'N/A';
}

export function formatBattery(mah) {
  if (!mah) return 'N/A';
  return `${mah.toLocaleString()} mAh`;
}

export function formatYear(year) {
  return year || 'N/A';
}

export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function tierColor(tier) {
  const map = {
    Flagship: '#10b981',
    'Upper Midrange': '#3b82f6',
    Midrange: '#f59e0b',
    Entry: '#ef4444',
    Unknown: '#6b7280',
    Excellent: '#10b981',
    Good: '#3b82f6',
    Average: '#f59e0b',
    Low: '#ef4444',
    Basic: '#6b7280',
  };
  return map[tier] || '#6b7280';
}
