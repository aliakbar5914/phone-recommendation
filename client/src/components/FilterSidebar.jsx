import { useState, useEffect } from 'react';
import { getBrands } from '../api/phoneApi';
import styles from './FilterSidebar.module.css';

const CHIPSET_TIERS = ['Flagship', 'Upper Midrange', 'Midrange', 'Entry'];
const CATEGORIES = ['Gaming', 'Camera', 'Battery', 'Budget', 'Student', 'Business', 'Daily Use'];
const RAM_OPTIONS = [4, 6, 8, 12, 16];
const STORAGE_OPTIONS = [64, 128, 256, 512];

export default function FilterSidebar({ filters, onFilterChange, onReset }) {
  const [brands, setBrands] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getBrands().then(res => setBrands(res.data)).catch(() => {});
  }, []);

  const update = (key, value) => onFilterChange({ ...filters, [key]: value });

  return (
    <>
      <button className={styles.mobileToggle} onClick={() => setOpen(!open)}>
        {open ? '✕ Close Filters' : '☰ Filters'}
      </button>

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <button className={styles.resetBtn} onClick={onReset}>Reset All</button>
        </div>

        {/* Brand */}
        <div className={styles.section}>
          <label className={styles.label}>Brand</label>
          <select value={filters.brand || ''} onChange={e => update('brand', e.target.value)}>
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Price Range */}
        <div className={styles.section}>
          <label className={styles.label}>Price Range (USD)</label>
          <div className={styles.row}>
            <input type="number" placeholder="Min" value={filters.minPrice || ''} onChange={e => update('minPrice', e.target.value)} />
            <input type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={e => update('maxPrice', e.target.value)} />
          </div>
        </div>

        {/* Release Year */}
        <div className={styles.section}>
          <label className={styles.label}>Release Year</label>
          <select value={filters.year || ''} onChange={e => update('year', e.target.value)}>
            <option value="">All Years</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Chipset Tier */}
        <div className={styles.section}>
          <label className={styles.label}>Chipset Tier</label>
          <select value={filters.chipsetTier || ''} onChange={e => update('chipsetTier', e.target.value)}>
            <option value="">All Tiers</option>
            {CHIPSET_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className={styles.section}>
          <label className={styles.label}>Category</label>
          <select value={filters.category || ''} onChange={e => update('category', e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Min RAM */}
        <div className={styles.section}>
          <label className={styles.label}>Minimum RAM</label>
          <select value={filters.minRam || ''} onChange={e => update('minRam', e.target.value)}>
            <option value="">Any</option>
            {RAM_OPTIONS.map(r => <option key={r} value={r}>{r} GB+</option>)}
          </select>
        </div>

        {/* Min Storage */}
        <div className={styles.section}>
          <label className={styles.label}>Minimum Storage</label>
          <select value={filters.minStorage || ''} onChange={e => update('minStorage', e.target.value)}>
            <option value="">Any</option>
            {STORAGE_OPTIONS.map(s => <option key={s} value={s}>{s} GB+</option>)}
          </select>
        </div>

        {/* Feature Toggles */}
        <div className={styles.section}>
          <label className={styles.label}>Features</label>
          <div className={styles.toggleGroup}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={filters.supports5G === 'true'} onChange={e => update('supports5G', e.target.checked ? 'true' : '')} />
              <span>5G</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={filters.supportsNFC === 'true'} onChange={e => update('supportsNFC', e.target.checked ? 'true' : '')} />
              <span>NFC</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={filters.hasDualSim === 'true'} onChange={e => update('hasDualSim', e.target.checked ? 'true' : '')} />
              <span>Dual SIM</span>
            </label>
          </div>
        </div>
      </aside>
    </>
  );
}
