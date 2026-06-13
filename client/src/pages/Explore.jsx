import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPhones } from '../api/phoneApi';
import { addToShortlist, getShortlist, removeFromShortlist } from '../api/shortlistApi';
import { getPreferences } from '../api/preferenceApi';
import { useCompare } from '../context/CompareContext';
import { getBrandStyle } from '../utils/brandPlaceholders';
import BrandLogo from '../components/BrandLogo';
import styles from './Explore.module.css';

/* ── Static config ──────────────────────────────────────────────────────── */
const USE_CASES = [
  { id: 'Gaming',   label: 'Gaming',   icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h2M15 13h2"/></svg>) },
  { id: 'Camera',   label: 'Camera',   icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>) },
  { id: 'Battery',  label: 'Battery',  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><path d="M23 13v-2"/></svg>) },
  { id: 'Student',  label: 'Student',  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>) },
  { id: 'Business', label: 'Business', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>) },
  { id: 'Daily Use',label: 'Everyday', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>) },
];

const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Motorola', 'Sony'];

const BUDGET_PRESETS = [
  { label: 'Budget',    range: 'Under $300',    max: 300  },
  { label: 'Mid-range', range: '$300–$700',     max: 700  },
  { label: 'Flagship',  range: '$700–$1,100',   max: 1100 },
  { label: 'Ultra',     range: '$1,100+',       max: 3000 },
];

const RAM_OPTIONS     = [0, 4, 6, 8, 12, 16];
const STORAGE_OPTIONS = [0, 64, 128, 256, 512];
const CHIPSET_TIERS   = ['', 'Flagship', 'Upper Midrange', 'Midrange', 'Entry'];

const ORB_COLS = [
  ['rgba(129,140,248,0.35)', 'rgba(167,139,250,0.2)'],
  ['rgba(56,189,248,0.18)',  'rgba(129,140,248,0.12)'],
  ['rgba(99,102,241,0.18)', 'rgba(139,92,246,0.12)'],
];
const BAND_BG = ['#0c0c18', '#0c0f18', '#0c0d16'];
const BADGES  = ['★ Best match', 'Strong alt.', 'Value pick'];

/* ── Helpers ────────────────────────────────────────────────────────────── */
function tierScore(tier) { return { Flagship: 95, 'Upper Midrange': 78, Midrange: 60, Entry: 40 }[tier] || 30; }
function batteryScore(mah) { return mah ? Math.min(100, Math.round((mah / 7000) * 100)) : 0; }
function cameraScore(tier) { return { Excellent: 95, Good: 75, Average: 50, Basic: 30 }[tier] || 30; }

/* ── Component ──────────────────────────────────────────────────────────── */
export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCompare, removeFromCompare, isInCompare, compareList, canAddMore } = useCompare();

  /* Filter state */
  const [activeUC,      setActiveUC]      = useState(USE_CASES[0].id);
  const [activeBrand,   setActiveBrand]   = useState(null);
  const [maxPrice,      setMaxPrice]      = useState(1100);
  const [activePreset,  setActivePreset]  = useState(2);
  const [search,        setSearch]        = useState('');
  const [minRam,        setMinRam]        = useState(0);
  const [minStorage,    setMinStorage]    = useState(0);
  const [chipsetTier,   setChipsetTier]   = useState('');

  /* Data state */
  const [phones,       setPhones]       = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [shortlistIds, setShortlistIds] = useState(new Set());
  const [surveyMode,   setSurveyMode]   = useState(false);
  const [surveyLabel,  setSurveyLabel]  = useState('');

  /* Load shortlist IDs */
  useEffect(() => {
    getShortlist()
      .then(res => setShortlistIds(new Set(res.data.map(i => i.phoneId?._id || i.phoneId))))
      .catch(() => {});
  }, []);

  /* Fetch phones */
  const fetchPhones = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort: 'newest', limit: 12, page: 1 };
      if (activeUC)         params.category    = activeUC;
      if (activeBrand)      params.brand       = activeBrand;
      if (maxPrice < 3000)  params.maxPrice    = maxPrice;
      if (minRam > 0)       params.minRam      = minRam;
      if (minStorage > 0)   params.minStorage  = minStorage;
      if (chipsetTier)      params.chipsetTier = chipsetTier;
      if (search.trim())    params.search      = search.trim();

      const res = await getPhones(params);
      setPhones(res.data.phones);
      setTotal(res.data.total);
    } catch { setPhones([]); }
    setLoading(false);
  }, [activeUC, activeBrand, maxPrice, minRam, minStorage, chipsetTier, search]);

  useEffect(() => { fetchPhones(); }, [fetchPhones]);

  /* Auto-apply survey when navigating from /survey */
  const applySurvey = useCallback(async () => {
    try {
      const res  = await getPreferences();
      const prefs = res.data;
      if (!prefs) return;

      const ucMatch = USE_CASES.find(u => u.id === prefs.primaryUse);
      if (ucMatch) setActiveUC(ucMatch.id);
      if (prefs.budget?.max)  { setMaxPrice(prefs.budget.max); setActivePreset(null); }
      if (prefs.preferredBrands?.length === 1) setActiveBrand(prefs.preferredBrands[0]);
      if (prefs.minRam)       setMinRam(prefs.minRam);
      if (prefs.minStorage)   setMinStorage(prefs.minStorage);

      // Map camera pref → chipset tier hint
      const camFeat = (prefs.requiredFeatures || []).find(f => f.startsWith('camera:'));
      if (camFeat) {
        const camId = camFeat.replace('camera:', '');
        if (camId === 'creator' || camId === 'enthusiast') setChipsetTier('Flagship');
      }

      const parts = [];
      if (ucMatch) parts.push(ucMatch.label);
      if (prefs.preferredBrands?.length) parts.push(prefs.preferredBrands.join('/'));
      if (prefs.budget?.max) parts.push(`≤$${prefs.budget.max}`);
      if (prefs.minRam)      parts.push(`${prefs.minRam}GB RAM`);
      if (prefs.minStorage)  parts.push(`${prefs.minStorage}GB storage`);
      setSurveyLabel(parts.join(' · '));
      setSurveyMode(true);
    } catch { /* no prefs */ }
  }, []);

  /* Auto-apply on ?fromSurvey=true */
  useEffect(() => {
    if (new URLSearchParams(location.search).get('fromSurvey') === 'true') {
      applySurvey();
    }
  }, [applySurvey, location.search]);

  const clearSurveyMode = () => {
    setSurveyMode(false);
    setSurveyLabel('');
    setActiveUC(USE_CASES[0].id);
    setActiveBrand(null);
    setMaxPrice(1100);
    setActivePreset(2);
    setMinRam(0);
    setMinStorage(0);
    setChipsetTier('');
  };

  const handlePreset = (idx) => { setActivePreset(idx); setMaxPrice(BUDGET_PRESETS[idx].max); };
  const pricePercent = Math.round(((maxPrice - 100) / 2900) * 100);

  const toggleShortlist = async (phoneId) => {
    if (shortlistIds.has(phoneId)) {
      await removeFromShortlist(phoneId).catch(() => {});
      setShortlistIds(prev => { const s = new Set(prev); s.delete(phoneId); return s; });
    } else {
      await addToShortlist(phoneId).catch(() => {});
      setShortlistIds(prev => new Set(prev).add(phoneId));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Survey banner / prompt ─────────────────────────── */}
        {surveyMode ? (
          <div className={styles.surveyBanner}>
            <span className={styles.surveyBannerIcon}>✨</span>
            <div className={styles.surveyBannerText}>
              <strong>Curated from your survey</strong>
              {surveyLabel && <span>{surveyLabel}</span>}
            </div>
            <button className={styles.surveyBannerClear} onClick={clearSurveyMode}>Use manual filters ✕</button>
          </div>
        ) : (
          <div className={styles.surveyPrompt}>
            <button className={styles.surveyBtn} onClick={applySurvey}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Use My Survey Preferences
            </button>
          </div>
        )}

        {/* ── Tool header ───────────────────────────────────── */}
        <div className={styles.toolHeader}>
          <div className="eyebrow">Find your match</div>
          <div className={styles.toolTitle}>What matters to you?</div>
          <div className={styles.toolSub}>Set your priorities. We'll rank every phone by what you actually care about.</div>
        </div>

        {/* ── Filter shell ──────────────────────────────────── */}
        <div className={styles.filterShell}>

          {/* ── Left: main filters ──────────────────────────── */}
          <div className={styles.filterMain}>

            {/* Search */}
            <div className={styles.searchBar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search phones, chipsets, brands…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Use-case tiles */}
            <div className={styles.ucRow}>
              {USE_CASES.map(uc => (
                <div key={uc.id} className={`${styles.ucTile} ${activeUC === uc.id ? styles.ucActive : ''}`} onClick={() => setActiveUC(uc.id)}>
                  <span className={styles.ucIcon}>{uc.icon}</span>
                  <span className={styles.ucLabel}>{uc.label}</span>
                </div>
              ))}
            </div>

            {/* Brand pills — with SVG logos */}
            <div className={styles.filterRow}>
              <span className={styles.filterRowLabel}>Brand</span>
              <div className={styles.pills}>
                {BRANDS.map(b => (
                  <button
                    key={b}
                    className={`${styles.brandPill} ${activeBrand === b ? styles.pillActive : ''}`}
                    onClick={() => setActiveBrand(activeBrand === b ? null : b)}
                  >
                    <BrandLogo brand={b} size="sm" />
                    <span>{b}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chipset tier pills */}
            <div className={styles.filterRow}>
              <span className={styles.filterRowLabel}>Tier</span>
              <div className={styles.pills}>
                {CHIPSET_TIERS.filter(t => t).map(t => (
                  <button key={t} className={`${styles.pill} ${chipsetTier === t ? styles.pillActive : ''}`} onClick={() => setChipsetTier(chipsetTier === t ? '' : t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right: sidebar (budget + RAM + storage) ──────── */}
          <div className={styles.filterSidebar}>

            {/* Budget */}
            <div className={styles.sidebarLabel}>Budget</div>
            <div className={styles.priceDisplay}>
              <span className={styles.priceVal}>${maxPrice >= 3000 ? '3000+' : maxPrice.toLocaleString()}</span>
              <span className={styles.priceMax}>max</span>
            </div>
            <div className={styles.rangeTrack}>
              <div className={styles.rangeFill} style={{ width: `${pricePercent}%` }} />
              <input
                type="range" min="100" max="3000" value={maxPrice}
                className={styles.rangeInput}
                onChange={e => { setMaxPrice(Number(e.target.value)); setActivePreset(null); }}
              />
            </div>
            <div className={styles.budgetPresets}>
              {BUDGET_PRESETS.map((p, i) => (
                <div key={p.label} className={`${styles.budgetPreset} ${activePreset === i ? styles.presetActive : ''}`} onClick={() => handlePreset(i)}>
                  <span className={styles.presetName}>{p.label}</span>
                  <span className={styles.presetRange}>{p.range}</span>
                </div>
              ))}
            </div>

            {/* RAM */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarLabel}>Min RAM</div>
              <div className={styles.sidebarChips}>
                {RAM_OPTIONS.map(r => (
                  <button key={r} className={`${styles.sidebarChip} ${minRam === r ? styles.chipActive : ''}`} onClick={() => setMinRam(r)}>
                    {r === 0 ? 'Any' : `${r}GB`}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarLabel}>Min Storage</div>
              <div className={styles.sidebarChips}>
                {STORAGE_OPTIONS.map(s => (
                  <button key={s} className={`${styles.sidebarChip} ${minStorage === s ? styles.chipActive : ''}`} onClick={() => setMinStorage(s)}>
                    {s === 0 ? 'Any' : `${s}GB`}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button className={styles.resetBtn} onClick={clearSurveyMode}>
              Reset all filters
            </button>
          </div>

        </div>

        {/* ── Results ───────────────────────────────────────── */}
        <div className={styles.resultsHeader}>
          <div className={styles.resultsLabel}>
            {loading ? 'Searching…' : `${total} match${total !== 1 ? 'es' : ''} found`}
          </div>
        </div>

        {loading ? (
          <div className={styles.cardsRow}>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</div>
        ) : phones.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 44, height: 44, marginBottom: 12, color: 'var(--muted)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No phones match your filters</h3>
            <p>Try adjusting your budget, brand, or specs.</p>
          </div>
        ) : (
          <div className={`${styles.cardsRow} stagger`}>
            {phones.map((phone, i) => (
              <PhoneCard
                key={phone._id}
                phone={phone}
                rank={i}
                isShortlisted={shortlistIds.has(phone._id)}
                onShortlist={toggleShortlist}
                inCompare={isInCompare(phone._id)}
                onCompare={() => isInCompare(phone._id) ? removeFromCompare(phone._id) : canAddMore && addToCompare(phone)}
                canAddMore={canAddMore}
                onClick={() => navigate(`/phones/${phone._id}`)}
              />
            ))}
          </div>
        )}

        {/* Compare bar */}
        {compareList.length >= 2 && (
          <div className={styles.compareBar}>
            <span className={styles.compareBarText}>
              Want a deeper look? <strong>Compare</strong> these {compareList.length} phones side by side.
            </span>
            <button className={styles.btnCompare} onClick={() => navigate('/compare')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M8 21H5a2 2 0 0 0-2-2v-3M21 16v3a2 2 0 0 0-2 2h-3"/>
              </svg>
              Compare all {compareList.length}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Phone Card ─────────────────────────────────────────────────────────── */
function PhoneCard({ phone, rank, isShortlisted, onShortlist, inCompare, onCompare, canAddMore, onClick }) {
  const isTop  = rank === 0;
  const orbs   = ORB_COLS[rank] || ORB_COLS[2];
  const bandBg = BAND_BG[rank]  || BAND_BG[2];
  const badge  = BADGES[rank]   || 'Pick';

  const perf    = tierScore(phone.chipsetTier);
  const battery = batteryScore(phone.batteryMah);
  const camera  = cameraScore(phone.cameraTier);
  const price   = phone.priceApprox ? `$${phone.priceApprox.toLocaleString()}` : phone.priceText?.split('/')[0]?.trim() || '–';

  return (
    <div className={`${styles.card} ${isTop ? styles.cardTop : ''}`} onClick={onClick}>
      {/* Band with brand logo */}
      <div className={styles.cardBand} style={{ background: bandBg }}>
        <div className={styles.orbA} style={{ background: orbs[0] }} />
        <div className={styles.orbB} style={{ background: orbs[1] }} />
        <div className={`${styles.bandBadge} ${isTop ? styles.badgeGold : styles.badgeSilver}`}>{badge}</div>
        <div className={styles.bandRank}>#{rank + 1}</div>
        <div className={styles.bandBrand}>
          <BrandLogo brand={phone.brand} size="md" />
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.cardBrandLabel}>{phone.brand}</div>
        <div className={styles.cardName}>{phone.phoneName}</div>
        <div className={styles.cardPrice}>
          <strong>{price}</strong>
          {phone.releaseYear && <> · {phone.releaseYear}</>}
        </div>

        <div className={styles.scores}>
          <ScoreRow label="Performance" value={perf} />
          <ScoreRow label="Camera"      value={camera} />
          <ScoreRow label="Battery"     value={battery} />
        </div>

        <div className={styles.cardSpecs}>
          {phone.chipset    && <div className={styles.specRow}><span className={styles.specKey}>Chip</span><span className={styles.specVal}>{phone.chipset.split('(')[0].trim()}</span></div>}
          {phone.displaySize && <div className={styles.specRow}><span className={styles.specKey}>Display</span><span className={styles.specVal}>{phone.displaySize.split(',')[0]}{phone.refreshRate ? ` · ${phone.refreshRate}Hz` : ''}</span></div>}
          {phone.batteryMah  && <div className={styles.specRow}><span className={styles.specKey}>Battery</span><span className={styles.specVal}>{phone.batteryMah.toLocaleString()} mAh</span></div>}
        </div>

        <div className={styles.cardAction}>
          <button className={`${styles.btnDetails} ${isTop ? styles.btnDetailsTop : ''}`} onClick={e => { e.stopPropagation(); onClick(); }}>
            View Details →
          </button>
          <button className={`${styles.btnSave} ${isShortlisted ? styles.btnSaved : ''}`} title={isShortlisted ? 'In Shortlist' : 'Save'} onClick={e => { e.stopPropagation(); onShortlist(phone._id); }}>
            <svg viewBox="0 0 24 24" fill={isShortlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button className={`${styles.btnSave} ${inCompare ? styles.btnComparing : ''}`} title={inCompare ? 'Remove from Compare' : 'Compare'} onClick={e => { e.stopPropagation(); onCompare(); }} disabled={!inCompare && !canAddMore}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M8 21H5a2 2 0 0 0-2-2v-3M21 16v3a2 2 0 0 0-2 2h-3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreBarBg}><div className={styles.scoreBarFill} style={{ width: `${value}%` }} /></div>
      <span className={styles.scoreNum}>{value}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.card} style={{ opacity: 0.35, pointerEvents: 'none' }}>
      <div className={styles.cardBand} style={{ background: 'var(--surface2)' }} />
      <div className={styles.cardBody}>
        <div style={{ height: 9,  width: 48,    background: 'var(--surface2)', borderRadius: 4, marginBottom: 8  }} />
        <div style={{ height: 18, width: '80%', background: 'var(--surface2)', borderRadius: 4, marginBottom: 8  }} />
        <div style={{ height: 12, width: '40%', background: 'var(--surface2)', borderRadius: 4, marginBottom: 20 }} />
        <div style={{ height: 32,               background: 'var(--surface2)', borderRadius: 9                   }} />
      </div>
    </div>
  );
}
