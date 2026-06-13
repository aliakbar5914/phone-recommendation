require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
const Phone = require('../models/Phone');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {
  classifyChipset,
  classifyCamera,
  classifyBattery,
  generateTags,
  getBrandPlaceholder,
} = require('../helpers/classifiers');

// ── Known brands for extraction ───────────────────────────────────────────────
const KNOWN_BRANDS = [
  'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing',
  'Motorola', 'Nokia', 'Huawei', 'Oppo', 'Vivo', 'Realme', 'Asus',
  'Honor', 'Poco', 'iQOO', 'Infinix', 'Tecno', 'ZTE', 'Lenovo', 'Sony',
];

function extractBrand(name) {
  const lower = name.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lower.startsWith(brand.toLowerCase())) return brand;
  }
  // Handle sub-brands like "Xiaomi Poco" → "Xiaomi"
  if (lower.startsWith('poco')) return 'Xiaomi';
  if (lower.startsWith('redmi')) return 'Xiaomi';
  return name.split(' ')[0];
}

// ── Parse approximate price (first USD/EUR/GBP amount) ────────────────────────
function extractPrice(priceText) {
  if (!priceText) return null;
  // Try USD first
  let m = priceText.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')));
  // Try EUR
  m = priceText.match(/€\s*([\d,]+(?:\.\d+)?)/);
  if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')));
  // Try GBP
  m = priceText.match(/£\s*([\d,]+(?:\.\d+)?)/);
  if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')));
  // Try "About X EUR/USD"
  m = priceText.match(/about\s*([\d,]+)\s*(eur|usd)/i);
  if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')));
  // Try INR and convert roughly
  m = priceText.match(/₹\s*([\d,]+)/);
  if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')) / 85);
  return null;
}

// ── Parse release year ────────────────────────────────────────────────────────
function extractYear(announced) {
  if (!announced) return null;
  const m = announced.match(/(20\d{2})/);
  return m ? parseInt(m[1]) : null;
}

// ── Parse battery mAh ─────────────────────────────────────────────────────────
function extractBatteryMah(batteryType) {
  if (!batteryType) return null;
  const m = batteryType.match(/(\d{4,5})\s*mah/i);
  return m ? parseInt(m[1]) : null;
}

// ── Parse refresh rate from display type ──────────────────────────────────────
function extractRefreshRate(displayType) {
  if (!displayType) return null;
  const m = displayType.match(/(\d{2,3})\s*Hz/i);
  return m ? parseInt(m[1]) : null;
}

// ── Parse RAM and storage options from memory internal ────────────────────────
function parseMemory(memoryInternal) {
  if (!memoryInternal) return { ramOptions: [], storageOptions: [] };
  const ramSet = new Set();
  const storageSet = new Set();

  // Matches patterns like "128GB 8GB RAM" or "256GB 12GB RAM"
  const variants = memoryInternal.split(',').map(s => s.trim());
  for (const v of variants) {
    // Match storage (comes first, like "128GB")
    const storageMatch = v.match(/^(\d+)\s*(?:GB|TB)/i);
    if (storageMatch) {
      let val = parseInt(storageMatch[1]);
      if (v.match(/^(\d+)\s*TB/i)) val *= 1024;
      storageSet.add(val);
    }
    // Match RAM (like "8GB RAM")
    const ramMatch = v.match(/(\d+)\s*GB\s*RAM/i);
    if (ramMatch) {
      ramSet.add(parseInt(ramMatch[1]));
    }
  }

  return {
    ramOptions: [...ramSet].sort((a, b) => a - b),
    storageOptions: [...storageSet].sort((a, b) => a - b),
  };
}

// ── Check if phone supports dual SIM ──────────────────────────────────────────
function checkDualSim(simField) {
  if (!simField) return false;
  const lower = simField.toLowerCase();
  return (
    lower.includes('dual') ||
    lower.includes('nano-sim + nano-sim') ||
    lower.includes('nano-sim + esim') ||
    lower.includes('esim + esim')
  );
}

// ── Check NFC support ─────────────────────────────────────────────────────────
function checkNFC(nfcField) {
  if (!nfcField) return false;
  const lower = nfcField.toLowerCase().trim();
  return lower === 'yes' || lower.startsWith('yes');
}

// ── Check headphone jack ──────────────────────────────────────────────────────
function checkHeadphoneJack(jackField) {
  if (!jackField) return false;
  const lower = jackField.toLowerCase().trim();
  return lower === 'yes' || lower.startsWith('yes');
}

// ── Check 5G support ──────────────────────────────────────────────────────────
function check5G(networkTech, bands5G) {
  if (bands5G && bands5G.trim().length > 0) return true;
  if (networkTech && networkTech.toLowerCase().includes('5g')) return true;
  return false;
}

// ── Combine camera fields ─────────────────────────────────────────────────────
function combineCamera(row) {
  const fields = [
    row['Main Camera - Single'],
    row['Main Camera - Dual'],
    row['Main Camera - Triple'],
    row['Main Camera - Quad'],
  ].filter(Boolean);
  return fields.join(' | ') || '';
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Read wide CSV
  const csvPath = path.join(__dirname, '../../phone_specs_wide.csv');
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  console.log(`Parsed ${rows.length} rows from wide CSV`);

  // Build phone documents
  const docs = [];
  for (const row of rows) {
    const phoneName = row['phone_name']?.trim();
    if (!phoneName) continue;

    // Skip non-phone devices (smartwatches, etc.)
    if (row['Network - Technology'] === 'No cellular connectivity') continue;

    const brand = extractBrand(phoneName);
    const priceText = row['Misc - Price'] || '';
    const priceApprox = extractPrice(priceText);
    const releaseText = row['Launch - Announced'] || '';
    const releaseYear = extractYear(releaseText);
    const networkTechnology = row['Network - Technology'] || '';
    const supports5G = check5G(networkTechnology, row['Network - 5G bands']);

    const sim = row['Body - SIM'] || '';
    const hasDualSim = checkDualSim(sim);

    const displayType = row['Display - Type'] || '';
    const refreshRate = extractRefreshRate(displayType);

    const chipset = row['Platform - Chipset'] || '';
    const chipsetTier = classifyChipset(chipset);

    const memoryInternal = row['Memory - Internal'] || '';
    const { ramOptions, storageOptions } = parseMemory(memoryInternal);

    const mainCamera = combineCamera(row);
    const mainCameraFeatures = row['Main Camera - Features'] || '';
    const mainCameraVideo = row['Main Camera - Video'] || '';
    const cameraTier = classifyCamera(mainCamera, mainCameraVideo, mainCameraFeatures);

    const selfieCamera = row['Selfie camera - Single'] || row['Selfie camera - Dual'] || '';
    const selfieCameraVideo = row['Selfie camera - Video'] || '';

    const batteryType = row['Battery - Type'] || '';
    const batteryMah = extractBatteryMah(batteryType);
    const charging = row['Battery - Charging'] || '';
    const batteryTier = classifyBattery(batteryMah);

    const nfc = row['Comms - NFC'] || '';
    const supportsNFC = checkNFC(nfc);
    const usb = row['Comms - USB'] || '';
    const headphoneJack = row['Sound - 3.5mm jack'] || '';
    const hasHeadphoneJack = checkHeadphoneJack(headphoneJack);

    // Build partial doc to pass to generateTags
    const partial = {
      chipsetTier,
      refreshRate,
      cameraTier,
      batteryMah,
      priceApprox,
      supports5G,
      supportsNFC,
    };
    const categoryTags = generateTags(partial);

    const brandPlaceholder = getBrandPlaceholder(brand);

    docs.push({
      phoneName,
      brand,
      sourceUrl: row['url'] || '',

      priceText,
      priceApprox,

      releaseText,
      releaseYear,

      networkTechnology,
      supports5G,

      bodyDimensions: row['Body - Dimensions'] || '',
      weight: row['Body - Weight'] || '',
      sim,
      hasDualSim,

      displayType,
      displaySize: row['Display - Size'] || '',
      displayResolution: row['Display - Resolution'] || '',
      refreshRate,

      os: row['Platform - OS'] || '',
      chipset,
      cpu: row['Platform - CPU'] || '',
      gpu: row['Platform - GPU'] || '',
      chipsetTier,

      memoryInternal,
      ramOptions,
      storageOptions,

      mainCamera,
      mainCameraFeatures,
      mainCameraVideo,
      cameraTier,

      selfieCamera,
      selfieCameraVideo,

      batteryType,
      batteryMah,
      charging,
      batteryTier,

      nfc,
      supportsNFC,
      usb,
      headphoneJack,
      hasHeadphoneJack,

      categoryTags,

      imageUrl: null,
      brandPlaceholder,

      rawSpecs: row,
    });
  }

  console.log(`Built ${docs.length} phone documents`);

  // Wipe and re-insert phones
  await Phone.deleteMany({});
  const inserted = await Phone.insertMany(docs);
  console.log(`Inserted ${inserted.length} phones`);

  // Log some stats
  const tiers = {};
  for (const d of docs) {
    tiers[d.chipsetTier] = (tiers[d.chipsetTier] || 0) + 1;
  }
  console.log('Chipset tier distribution:', tiers);

  const cameraTiers = {};
  for (const d of docs) {
    cameraTiers[d.cameraTier] = (cameraTiers[d.cameraTier] || 0) + 1;
  }
  console.log('Camera tier distribution:', cameraTiers);

  const withPrice = docs.filter(d => d.priceApprox).length;
  console.log(`Phones with price: ${withPrice}/${docs.length}`);

  // Create default admin if none exists
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@1234', 12);
    await User.create({
      name: 'Admin',
      email: 'admin@phonefinder.com',
      passwordHash,
      role: 'admin',
      hasCompletedSurvey: true,
    });
    console.log('Created default admin: admin@phonefinder.com / Admin@1234');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
