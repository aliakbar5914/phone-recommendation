import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPreferences, savePreferences, updatePreferences } from '../api/preferenceApi';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import styles from './Survey.module.css';

/* ── Static data ─────────────────────────────────────────────────────── */
const BUDGET_CHIPS = [
  { label: 'Under $200', min: 0,    max: 200  },
  { label: '$200–400',   min: 200,  max: 400  },
  { label: '$400–700',   min: 400,  max: 700  },
  { label: '$700–1000',  min: 700,  max: 1000 },
  { label: '$1000+',     min: 1000, max: 3000 },
];

const PRIMARY_USES = [
  { id: 'Gaming',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h2M15 13h2"/></svg>, label: 'Gaming',              desc: 'High performance & fast screens'  },
  { id: 'Camera',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>, label: 'Camera & Social Media', desc: 'Great photos, selfies & video'      },
  { id: 'Battery', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="1" y="6" width="18" height="12" rx="2"/><path d="M23 13v-2"/></svg>, label: 'Battery Life',         desc: 'All-day & multi-day endurance'     },
  { id: 'Daily Use',icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, label: 'Daily Use',            desc: 'Reliable for everyday tasks'       },
  { id: 'Business',icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, label: 'Work & Productivity',  desc: '5G connectivity & pro features'    },
  { id: 'Value',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label: 'Best Overall Value',   desc: 'Max specs for your money'          },
];

const CAMERA_OPTS = [
  { id: 'none',       label: 'Not important',              desc: 'I rarely use the camera'              },
  { id: 'casual',     label: 'Casual photos',              desc: 'Quick snaps for memories'             },
  { id: 'social',     label: 'Social media & selfies',     desc: 'Great for Instagram & TikTok'         },
  { id: 'enthusiast', label: 'Photography enthusiast',     desc: 'Portrait, night mode & detail'        },
  { id: 'creator',    label: 'Content creator / video',    desc: 'Pro video, 4K & stabilization'        },
];

const BRANDS = [
  'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Motorola', 'Others',
];

const STORAGE_OPTS = [
  { id: 64,  label: 'Basic Use',       desc: 'Apps, calls, messaging'       },
  { id: 128, label: 'Moderate',        desc: 'Photos, music, social media'  },
  { id: 256, label: 'Heavy Usage',     desc: 'Games, lots of photos & video'},
  { id: 512, label: 'Maximum Storage', desc: 'Creator-level content & apps' },
];

const PERF_OPTS = [
  { id: 4,  label: 'Basic everyday use',            desc: 'Calls, messaging, browsing'       },
  { id: 6,  label: 'Smooth multitasking',           desc: 'Social media, light gaming'       },
  { id: 8,  label: 'Heavy gaming & performance',    desc: 'Demanding apps, smooth gaming'    },
  { id: 12, label: 'Fastest possible experience',   desc: 'Flagship-grade everything'        },
];

const STEPS = ['Budget', 'Primary Use', 'Camera', 'Brands', 'Storage', 'Performance', 'Review'];
const TOTAL_STEPS = STEPS.length; // 7

const LOADING_MSGS = [
  'Analyzing your preferences…',
  'Matching performance needs…',
  'Preparing your phone recommendations…',
];

/* ── Internal mapping: user answers → API schema ─────────────────────── */
function buildApiPayload(form) {
  // Map camera pref to a requiredFeature tag
  const camFeature = form.cameraPreference !== 'none' ? `camera:${form.cameraPreference}` : null;

  // Map primary use label → internal id
  const useMap = { Value: 'Daily Use' }; // Value → Daily Use internally
  const primaryUse = useMap[form.primaryUse] || form.primaryUse;

  return {
    budget:          form.budget,
    primaryUse,
    preferredBrands: form.preferredBrands.filter(b => b !== 'Others'),
    minRam:          form.performanceRam,
    minStorage:      form.storageMin,
    requiredFeatures: camFeature ? [camFeature] : [],
    launchYearRange: { from: 2022, to: 2026 },
  };
}

const DEFAULT_FORM = {
  budget:            { min: 0, max: 1000 },
  primaryUse:        '',
  cameraPreference:  '',
  preferredBrands:   [],
  storageMin:        128,
  performanceRam:    6,
};

function formatBudget(b) {
  if (!b) return 'Any';
  if (b.max >= 3000) return `$${b.min}+`;
  if (!b.min) return `Under $${b.max}`;
  return `$${b.min}–$${b.max}`;
}

function normalizeIncoming(raw) {
  // Convert API prefs back to form shape (for display only in "existing" view)
  const camFeat = (raw?.requiredFeatures || []).find(f => f.startsWith('camera:'));
  return {
    budget:           raw?.budget || DEFAULT_FORM.budget,
    primaryUse:       raw?.primaryUse || '',
    cameraPreference: camFeat ? camFeat.replace('camera:', '') : '',
    preferredBrands:  raw?.preferredBrands || [],
    storageMin:       raw?.minStorage || 128,
    performanceRam:   raw?.minRam || 6,
  };
}

/* ── Survey component ────────────────────────────────────────────────── */
export default function Survey() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step,          setStep]          = useState(0);
  const [dir,           setDir]           = useState(1);  // 1 = forward, -1 = backward
  const [saving,        setSaving]        = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [loadingMsg,    setLoadingMsg]    = useState(0);
  const [retaking,      setRetaking]      = useState(false);
  const [existingPrefs, setExistingPrefs] = useState(null);
  const [error,         setError]         = useState('');
  const [form,          setForm]          = useState(DEFAULT_FORM);
  const [animKey,       setAnimKey]       = useState(0);
  const contentRef = useRef(null);

  /* Load existing prefs */
  useEffect(() => {
    let cancelled = false;
    getPreferences()
      .then(res => { if (!cancelled) { const f = normalizeIncoming(res.data); setExistingPrefs(f); setForm(f); } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingExisting(false); });
    return () => { cancelled = true; };
  }, []);

  /* Animate step change */
  const goTo = (next) => {
    setDir(next > step ? 1 : -1);
    setAnimKey(k => k + 1);
    setStep(next);
  };

  const back = () => step > 0 && goTo(step - 1);
  const next = () => step < TOTAL_STEPS - 1 && goTo(step + 1);

  /* Toggle brand */
  const toggleBrand = (b) =>
    setForm(p => ({
      ...p,
      preferredBrands: p.preferredBrands.includes(b)
        ? p.preferredBrands.filter(x => x !== b)
        : [...p.preferredBrands, b],
    }));

  /* Budget chip click */
  const selectBudgetChip = (chip) => {
    setForm(p => ({ ...p, budget: { min: chip.min, max: chip.max } }));
  };

  /* Submit */
  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const payload = buildApiPayload(form);
      if (existingPrefs || user?.hasCompletedSurvey) {
        await updatePreferences(payload).catch(() => savePreferences(payload));
      } else {
        await savePreferences(payload).catch(err => {
          if (err.response?.status === 409) return updatePreferences(payload);
          throw err;
        });
      }
      updateUser({ hasCompletedSurvey: true });
      for (let i = 0; i < LOADING_MSGS.length; i++) {
        setLoadingMsg(i);
        await new Promise(r => setTimeout(r, 900));
      }
      navigate('/explore?fromSurvey=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
      setSaving(false);
    }
  };

  /* ── Loading states ──────────────────────────────────────────────── */
  if (loadingExisting) return <LoadingScreen text="Loading your profile…" />;

  if (saving) return (
    <LoadingScreen
      text={LOADING_MSGS[loadingMsg]}
      progress={((loadingMsg + 1) / LOADING_MSGS.length) * 100}
      evaluation
    />
  );

  /* ── Existing preferences summary ───────────────────────────────── */
  if (existingPrefs && !retaking) {
    const camLabel = CAMERA_OPTS.find(c => c.id === existingPrefs.cameraPreference)?.label || 'Not specified';
    const storLabel = STORAGE_OPTS.find(s => s.id === existingPrefs.storageMin)?.label || `${existingPrefs.storageMin} GB+`;
    const perfLabel = PERF_OPTS.find(p => p.id === existingPrefs.performanceRam)?.label || `${existingPrefs.performanceRam} GB RAM`;
    const useLabel  = PRIMARY_USES.find(u => u.id === existingPrefs.primaryUse)?.label || existingPrefs.primaryUse;
    return (
      <div className={styles.survey}>
        <div className={styles.existingWrap}>
          <div className={styles.existingHeader}>
            <span className={styles.badge}>Your Profile</span>
            <h1>Your Phone Preferences</h1>
            <p>We've matched your style. Jump straight to results or update your preferences.</p>
            <div className={styles.existingActions}>
              <button className="btn btn-primary" onClick={() => navigate('/explore?fromSurvey=true')}>
                Find My Phones →
              </button>
              <button className="btn btn-secondary" onClick={() => { setRetaking(true); setStep(0); setAnimKey(k => k+1); }}>
                Update Preferences
              </button>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <SummaryCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Budget"      value={formatBudget(existingPrefs.budget)} />
            <SummaryCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>} label="Primary Use"  value={useLabel || '—'} />
            <SummaryCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>} label="Camera"       value={camLabel} />
            <SummaryCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>} label="Brands"
              value={existingPrefs.preferredBrands.length ? existingPrefs.preferredBrands.join(', ') : 'Any brand'} />
            <SummaryCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>} label="Storage"      value={storLabel} />
            <SummaryCard icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>} label="Performance"  value={perfLabel} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Step progress ───────────────────────────────────────────────── */
  const progress = ((step) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className={styles.survey}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.logo}>Phone<span>Finder</span></span>
        <Link to="/explore" className={styles.skipBtn}>Skip Survey</Link>
      </div>

      <div className={styles.shell}>
        {/* Progress track */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.stepPills}>
          {STEPS.map((name, i) => (
            <div key={name} className={`${styles.pill} ${i < step ? styles.pillDone : ''} ${i === step ? styles.pillActive : ''}`}>
              {i < step ? '✓' : i + 1}
            </div>
          ))}
        </div>

        {/* Question card */}
        <div className={styles.card} key={animKey} data-dir={dir > 0 ? 'forward' : 'back'}>

          {step === 0 && (
            <StepBudget
              form={form}
              chips={BUDGET_CHIPS}
              onChip={selectBudgetChip}
              onSlider={max => setForm(p => ({ ...p, budget: { ...p.budget, max } }))}
            />
          )}

          {step === 1 && (
            <StepChoice
              question="What matters most in your next phone?"
              sub="Pick the one that best describes your typical day."
              options={PRIMARY_USES}
              selected={form.primaryUse}
              onSelect={id => setForm(p => ({ ...p, primaryUse: id }))}
              iconKey="icon"
              descKey="desc"
            />
          )}

          {step === 2 && (
            <StepChoice
              question="How important is the camera experience?"
              sub="Be honest — there's no wrong answer."
              options={CAMERA_OPTS}
              selected={form.cameraPreference}
              onSelect={id => setForm(p => ({ ...p, cameraPreference: id }))}
              descKey="desc"
            />
          )}

          {step === 3 && (
            <StepBrands
              selected={form.preferredBrands}
              onToggle={toggleBrand}
            />
          )}

          {step === 4 && (
            <StepChoice
              question="How much space do you usually need?"
              sub="Think about apps, photos, music, and videos."
              options={STORAGE_OPTS}
              selected={form.storageMin}
              onSelect={id => setForm(p => ({ ...p, storageMin: id }))}
              descKey="desc"
            />
          )}

          {step === 5 && (
            <StepChoice
              question="How smooth do you expect your phone to feel?"
              sub="This helps us match chipset performance to your needs."
              options={PERF_OPTS}
              selected={form.performanceRam}
              onSelect={id => setForm(p => ({ ...p, performanceRam: id }))}
              descKey="desc"
            />
          )}

          {step === 6 && (
            <StepReview
              form={form}
              onEdit={goTo}
              formatBudget={formatBudget}
              primaryUseLabel={PRIMARY_USES.find(u => u.id === form.primaryUse)?.label}
              cameraLabel={CAMERA_OPTS.find(c => c.id === form.cameraPreference)?.label}
              storageLabel={STORAGE_OPTS.find(s => s.id === form.storageMin)?.label}
              perfLabel={PERF_OPTS.find(p => p.id === form.performanceRam)?.label}
            />
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* Navigation */}
        <div className={styles.nav}>
          <button className={`${styles.navBtn} ${styles.navBack}`} onClick={back} disabled={step === 0}>
            ← Back
          </button>
          <span className={styles.stepCounter}>{step + 1} / {TOTAL_STEPS}</span>
          {step < TOTAL_STEPS - 1 ? (
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next}>
              Continue →
            </button>
          ) : (
            <button className={`${styles.navBtn} ${styles.navSubmit}`} onClick={handleSubmit}>
              Find My Phones 🚀
            </button>
          )}
        </div>

        {retaking && (
          <button className={styles.cancelRetake} onClick={() => setRetaking(false)}>
            Cancel — keep existing preferences
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function LoadingScreen({ text, progress, evaluation }) {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingCard}>
        <div className={styles.loadingOrbs}>
          <div className={styles.orb1} /><div className={styles.orb2} /><div className={styles.orb3} />
        </div>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>{text}</p>
        {evaluation && (
          <div className={styles.evalBar}>
            <div className={styles.evalFill} style={{ width: `${progress}%` }} />
          </div>
        )}
        {evaluation && (
          <p className={styles.evalHint}>Matching {Math.round(progress)}% complete</p>
        )}
      </div>
    </div>
  );
}

function StepBudget({ form, chips, onChip, onSlider }) {
  const selected = chips.find(c => c.min === form.budget.min && c.max === form.budget.max);
  const displayMax = form.budget.max >= 3000 ? '3000+' : form.budget.max;
  const sliderPercent = Math.round(((form.budget.max - 100) / 2900) * 100);

  return (
    <div className={styles.stepInner}>
      <div className={styles.question}>
        <span className={styles.qNum}>Budget</span>
        <h2>What's your budget range?</h2>
        <p>Select a range or fine-tune with the slider below.</p>
      </div>

      <div className={styles.budgetDisplay}>
        <span className={styles.budgetVal}>${displayMax}</span>
        <span className={styles.budgetSub}>max budget</span>
      </div>

      <div className={styles.chips}>
        {chips.map(c => (
          <button
            key={c.label}
            className={`${styles.chip} ${c.min === form.budget.min && c.max === form.budget.max ? styles.chipActive : ''}`}
            onClick={() => onChip(c)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.sliderWrap}>
        <div className={styles.sliderTrack}>
          <div className={styles.sliderFill} style={{ width: `${sliderPercent}%` }} />
          <input
            type="range" min="100" max="3000" step="50"
            value={form.budget.max}
            className={styles.sliderInput}
            onChange={e => onSlider(Number(e.target.value))}
          />
        </div>
        <div className={styles.sliderLabels}>
          <span>$100</span><span>$3000+</span>
        </div>
      </div>
    </div>
  );
}

function StepChoice({ question, sub, options, selected, onSelect, iconKey, descKey }) {
  return (
    <div className={styles.stepInner}>
      <div className={styles.question}>
        <h2>{question}</h2>
        {sub && <p>{sub}</p>}
      </div>
      <div className={styles.choiceGrid}>
        {options.map(opt => (
          <button
            key={opt.id}
            className={`${styles.choiceCard} ${selected === opt.id ? styles.choiceActive : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            {iconKey && opt[iconKey] && <span className={styles.choiceIcon}>{opt[iconKey]}</span>}
            <span className={styles.choiceLabel}>{opt.label}</span>
            {descKey && opt[descKey] && <span className={styles.choiceDesc}>{opt[descKey]}</span>}
            <span className={styles.choiceCheck}>✓</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBrands({ selected, onToggle }) {
  return (
    <div className={styles.stepInner}>
      <div className={styles.question}>
        <h2>Any preferred brands?</h2>
        <p>Select all that you're open to. Skip if you have no preference.</p>
      </div>
      <div className={styles.brandGrid}>
        {BRANDS.map(b => (
          <button
            key={b}
            className={`${styles.brandCard} ${selected.includes(b) ? styles.brandActive : ''}`}
            onClick={() => onToggle(b)}
          >
            <BrandLogo brand={b} size="md" className={styles.brandLogoImg} />
            <span className={styles.brandName}>{b}</span>
            <span className={styles.brandCheck}>✓</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepReview({ form, onEdit, formatBudget, primaryUseLabel, cameraLabel, storageLabel, perfLabel }) {
  const rows = [
    { label: 'Budget',      value: formatBudget(form.budget),                step: 0, icon: '💸' },
    { label: 'Primary Use', value: primaryUseLabel || '—',                   step: 1, icon: '🎯' },
    { label: 'Camera',      value: cameraLabel || '—',                       step: 2, icon: '📷' },
    { label: 'Brands',      value: form.preferredBrands.length ? form.preferredBrands.join(', ') : 'Any brand', step: 3, icon: '🏷️' },
    { label: 'Storage',     value: storageLabel || '—',                      step: 4, icon: '💾' },
    { label: 'Performance', value: perfLabel || '—',                         step: 5, icon: '⚡' },
  ];
  return (
    <div className={styles.stepInner}>
      <div className={styles.question}>
        <span className={styles.qNum}>Final step</span>
        <h2>Your preferences look great</h2>
        <p>Review everything below, then let us find your ideal phone.</p>
      </div>
      <div className={styles.reviewGrid}>
        {rows.map(r => (
          <div key={r.label} className={styles.reviewRow}>
            <span className={styles.reviewIcon}>{r.icon}</span>
            <div className={styles.reviewInfo}>
              <span className={styles.reviewLabel}>{r.label}</span>
              <span className={styles.reviewValue}>{r.value}</span>
            </div>
            <button className={styles.editBtn} onClick={() => onEdit(r.step)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className={styles.summaryCard}>
      <span className={styles.summaryIcon}>{icon}</span>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={styles.summaryVal}>{value}</span>
    </div>
  );
}
