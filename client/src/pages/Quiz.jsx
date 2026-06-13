import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Quiz.module.css';

const STEPS = [
  {
    id: 'budget',
    question: "What's your budget?",
    sub: 'We\'ll only show phones that actually fit.',
    options: [
      { label: 'Under $300', sub: 'Budget picks', value: 300, icon: '💸' },
      { label: '$300 – $600', sub: 'Mid-range sweet spot', value: 600, icon: '💳' },
      { label: '$600 – $1,000', sub: 'Flagship territory', value: 1000, icon: '💎' },
      { label: '$1,000+', sub: 'Money is no object', value: 1500, icon: '🏆' },
    ],
    key: 'max_price',
  },
  {
    id: 'use_case',
    question: 'How will you use it most?',
    sub: 'Pick your primary use — we weight specs accordingly.',
    options: [
      { label: 'Camera', sub: 'Photography & video', value: 'photography', icon: '📸' },
      { label: 'Gaming', sub: 'Smooth performance', value: 'gaming', icon: '🎮' },
      { label: 'Battery life', sub: 'All-day endurance', value: 'battery', icon: '🔋' },
      { label: 'Everyday use', sub: 'Balanced & reliable', value: 'everyday', icon: '📱' },
      { label: 'Raw performance', sub: 'Best chip, max RAM', value: 'performance', icon: '⚡' },
    ],
    key: 'use_case',
  },
  {
    id: 'brand',
    question: 'Any brand preference?',
    sub: 'Skip this if you\'re open to anything.',
    options: [
      { label: 'Apple', value: 'Apple', icon: '🍎' },
      { label: 'Samsung', value: 'Samsung', icon: '🌌' },
      { label: 'Google', value: 'Google', icon: '🔍' },
      { label: 'OnePlus', value: 'OnePlus', icon: '🔴' },
      { label: 'Xiaomi', value: 'Xiaomi', icon: '🟠' },
      { label: 'No preference', value: null, icon: '✨' },
    ],
    key: 'brand',
  },
  {
    id: 'year',
    question: 'How recent does it need to be?',
    sub: 'Older phones can be great value.',
    options: [
      { label: '2025 only', sub: 'Cutting edge', value: 2025, icon: '🆕' },
      { label: '2024 or newer', sub: 'Still very current', value: 2024, icon: '📅' },
      { label: '2023 or newer', sub: 'Good balance', value: 2023, icon: '🗓️' },
      { label: 'Any year', sub: 'Best value wins', value: null, icon: '♾️' },
    ],
    key: 'release_year',
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const choose = (val) => {
    const next = { ...answers, [current.key]: val };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Build query and go to finder
      const params = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => { if (v !== null && v !== undefined) params.set(k, v); });
      navigate(`/find?${params.toString()}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Progress */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.stepCount}>{step + 1} of {STEPS.length}</div>

        <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>Phone Guide</div>
        <h2 className={styles.question}>{current.question}</h2>
        {current.sub && <p className={styles.sub}>{current.sub}</p>}

        <div className={styles.options}>
          {current.options.map(opt => (
            <button key={String(opt.value)} className={styles.option} onClick={() => choose(opt.value)}>
              <span className={styles.optIcon}>{opt.icon}</span>
              <div className={styles.optText}>
                <span className={styles.optLabel}>{opt.label}</span>
                {opt.sub && <span className={styles.optSub}>{opt.sub}</span>}
              </div>
              <svg className={styles.optArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        {step > 0 && (
          <button className={styles.back} onClick={() => setStep(s => s - 1)}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
