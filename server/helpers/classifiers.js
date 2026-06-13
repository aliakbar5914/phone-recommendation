// ── Chipset Tier Classification ────────────────────────────────────────────────
function classifyChipset(chipset = '') {
  const c = chipset.toLowerCase();

  if (
    c.includes('snapdragon 8') ||
    c.includes('apple a17') ||
    c.includes('apple a18') ||
    c.includes('apple a19') ||
    c.includes('dimensity 9') ||
    c.includes('exynos 2400') ||
    c.includes('exynos 2500') ||
    c.includes('tensor g4') ||
    c.includes('tensor g5')
  ) return 'Flagship';

  if (
    c.includes('snapdragon 7') ||
    c.includes('dimensity 8') ||
    c.includes('apple a15') ||
    c.includes('apple a16') ||
    c.includes('exynos 2200') ||
    c.includes('tensor g2') ||
    c.includes('tensor g3')
  ) return 'Upper Midrange';

  if (
    c.includes('snapdragon 6') ||
    c.includes('snapdragon 695') ||
    c.includes('snapdragon 782') ||
    c.includes('helio g99') ||
    c.includes('dimensity 7') ||
    c.includes('exynos 13') ||
    c.includes('exynos 1480') ||
    c.includes('exynos 1330')
  ) return 'Midrange';

  if (
    c.includes('snapdragon 4') ||
    c.includes('helio') ||
    c.includes('unisoc') ||
    c.includes('dimensity 6')
  ) return 'Entry';

  return 'Unknown';
}

// ── Camera Tier Classification ─────────────────────────────────────────────────
function classifyCamera(mainCamera = '', video = '', features = '') {
  const text = `${mainCamera} ${video} ${features}`.toLowerCase();

  if (
    text.includes('200 mp') ||
    text.includes('periscope') ||
    text.includes('8k')
  ) return 'Excellent';

  if (
    text.includes('108 mp') ||
    text.includes('50 mp') ||
    text.includes('ois') ||
    text.includes('4k')
  ) return 'Good';

  if (
    text.includes('48 mp') ||
    text.includes('32 mp')
  ) return 'Average';

  return 'Basic';
}

// ── Battery Tier Classification ────────────────────────────────────────────────
function classifyBattery(batteryMah) {
  if (!batteryMah || batteryMah <= 0) return 'Unknown';
  if (batteryMah >= 6000) return 'Excellent';
  if (batteryMah >= 5000) return 'Good';
  if (batteryMah >= 4000) return 'Average';
  return 'Low';
}

// ── Category Tags Generation ───────────────────────────────────────────────────
function generateTags(phone) {
  const tags = [];

  if (phone.chipsetTier === 'Flagship' || phone.refreshRate >= 90) {
    tags.push('Gaming');
  }

  if (phone.cameraTier === 'Good' || phone.cameraTier === 'Excellent') {
    tags.push('Camera');
  }

  if (phone.batteryMah >= 5000) {
    tags.push('Battery');
  }

  if (phone.priceApprox && phone.priceApprox <= 350) {
    tags.push('Budget');
  }

  if (
    phone.priceApprox &&
    phone.priceApprox <= 400 &&
    phone.batteryMah >= 4500
  ) {
    tags.push('Student');
  }

  if (phone.supports5G && phone.supportsNFC) {
    tags.push('Business');
  }

  if (tags.length === 0) {
    tags.push('Daily Use');
  }

  return tags;
}

// ── Brand image placeholder map ────────────────────────────────────────────────
const BRAND_PLACEHOLDER_MAP = {
  Apple: '/brand-placeholders/apple.png',
  Samsung: '/brand-placeholders/samsung.png',
  OnePlus: '/brand-placeholders/oneplus.png',
  Xiaomi: '/brand-placeholders/xiaomi.png',
  Google: '/brand-placeholders/google.png',
  Nothing: '/brand-placeholders/nothing.png',
  Motorola: '/brand-placeholders/motorola.png',
  default: '/brand-placeholders/default-phone.png',
};

function getBrandPlaceholder(brand) {
  return BRAND_PLACEHOLDER_MAP[brand] || BRAND_PLACEHOLDER_MAP.default;
}

module.exports = {
  classifyChipset,
  classifyCamera,
  classifyBattery,
  generateTags,
  getBrandPlaceholder,
  BRAND_PLACEHOLDER_MAP,
};
