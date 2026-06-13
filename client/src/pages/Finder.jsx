import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import styles from './Finder.module.css';

const USE_CASES = [
  { id: 'photography', label: 'Camera', icon: <svg className={styles.ucIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
  { id: 'gaming', label: 'Gaming', icon: <svg className={styles.ucIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h2M15 13h2"/></svg> },
  { id: 'battery', label: 'Battery', icon: <svg className={styles.ucIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><path d="M23 13v-2"/></svg> },
  { id: 'everyday', label: 'Everyday', icon: <svg className={styles.ucIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> },
  { id: 'performance', label: 'Performance', icon: <svg className={styles.ucIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
];

const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Sony', 'Nothing', 'Motorola', 'Realme', 'Asus'];
const YEARS = [2025, 2024, 2023, 2022, 2021];
const BADGES = ['Best match', 'Strong alt.', 'Value pick'];

export default function Finder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    useCase: searchParams.get('use_case') || 'photography',
    brand: searchParams.get('brand') || null,
    year: searchParams.get('release_year') ? Number(searchParams.get('release_year')) : null,
    maxPrice: 800,
    search: '',
    sort: 'relevance',
  });
  const [phones, setPhones] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const searchTimer = useRef(null);

  const fetchPhones = useCallback(async (f = filters, p = 1) => {
    setLoading(true);
    try {
      const params = { use_case: f.useCase, max_price: f.maxPrice, sort: f.sort, page: p, limit: 9 };
      if (f.brand) params.brand = f.brand;
      if (f.year) params.release_year = f.year;
      if (f.search) params.search = f.search;
      const res = await api.get('/phones', { params });
      setPhones(res.data.phones);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPhones(); }, []);

  useEffect(() => {
    if (user) {
      api.get('/wishlist').then(res => {
        setWishlistIds(new Set(res.data.map(i => i.phoneId._id)));
      }).catch(() => {});
    }
  }, [user]);

  const update = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchPhones(next, 1);
  };

  const handleSearch = (val) => {
    setFilters(f => ({ ...f, search: val }));
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchPhones({ ...filters, search: val }, 1);
    }, 400);
  };

  const toggleCompare = (id) => {
    setCompareIds(ids => ids.includes(id)
      ? ids.filter(i => i !== id)
      : ids.length < 3 ? [...ids, id] : ids
    );
  };

  const toggleWishlist = async (phoneId) => {
    if (!user) { navigate('/login'); return; }
    try {
      if (wishlistIds.has(phoneId)) {
        await api.delete(`/wishlist/${phoneId}`);
        setWishlistIds(s => { const n = new Set(s); n.delete(phoneId); return n; });
      } else {
        await api.post('/wishlist', { phoneId });
        setWishlistIds(s => new Set([...s, phoneId]));
      }
    } catch {}
  };

  return (
    <div className="page">
      <div className={styles.header}>
        <div className="eyebrow">Find your match</div>
        <h1 className={styles.title}>What matters to you?</h1>
        <p className={styles.sub}>Set your priorities. We&apos;ll rank every phone by what you actually care about.</p>
        <div className={styles.quizLink}>
          Not sure? <a onClick={() => navigate('/quiz')} style={{ color: 'var(--accent)', cursor: 'pointer' }}>Try our guided quiz instead →</a>
        </div>
      </div>

      <div className={styles.filterShell}>
        <div className={styles.filterMain}>
          {/* Search */}
          <div className={styles.searchBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search by name or brand…" value={filters.search}
              onChange={e => handleSearch(e.target.value)} />
          </div>

          {/* Use cases */}
          <div className={styles.ucRow}>
            {USE_CASES.map(uc => (
              <button key={uc.id}
                className={`${styles.ucTile} ${filters.useCase === uc.id ? styles.active : ''}`}
                onClick={() => update('useCase', uc.id)}>
                {uc.icon}
                <span className={styles.ucLabel}>{uc.label}</span>
              </button>
            ))}
          </div>

          {/* Brand */}
          <div className={styles.filterRow}>
            <span className={styles.filterRowLabel}>Brand</span>
            <div className={styles.pills}>
              {BRANDS.map(b => (
                <button key={b}
                  className={`${styles.pill} ${filters.brand === b ? styles.pillActive : ''}`}
                  onClick={() => update('brand', filters.brand === b ? null : b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div className={styles.filterRow}>
            <span className={styles.filterRowLabel}>Year</span>
            <div className={styles.pills}>
              {YEARS.map(y => (
                <button key={y}
                  className={`${styles.pill} ${filters.year === y ? styles.pillActive : ''}`}
                  onClick={() => update('year', filters.year === y ? null : y)}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className={styles.filterRow}>
            <span className={styles.filterRowLabel}>Sort</span>
            <div className={styles.pills}>
              {[['relevance','Relevance'],['price_asc','Price ↑'],['price_desc','Price ↓'],['newest','Newest']].map(([val,label]) => (
                <button key={val}
                  className={`${styles.pill} ${filters.sort === val ? styles.pillActive : ''}`}
                  onClick={() => update('sort', val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarLabel}>Budget</div>
          <div className={styles.priceDisplay}>
            <span className={styles.priceVal}>${filters.maxPrice.toLocaleString()}</span>
            <span className={styles.priceMax}>max</span>
          </div>
          <div className={styles.rangeTrack}>
            <div className={styles.rangeFill} style={{ width: `${((filters.maxPrice - 100) / 1400) * 100}%` }} />
            <input type="range" min="100" max="1500" value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
              onMouseUp={() => fetchPhones(filters, 1)}
              onTouchEnd={() => fetchPhones(filters, 1)} />
          </div>
          <div className={styles.presets}>
            {[[300,'Budget','Under $300'],[600,'Mid-range','$300–$700'],[900,'Flagship','$700–$1,100'],[1500,'Ultra','$1,100+']].map(([v,name,range]) => (
              <button key={v}
                className={`${styles.preset} ${filters.maxPrice === v ? styles.presetActive : ''}`}
                onClick={() => update('maxPrice', v)}>
                <span className={styles.presetName}>{name}</span>
                <span className={styles.presetRange}>{range}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultsLabel}>
          {loading ? 'Searching…' : `${total} phone${total !== 1 ? 's' : ''} found`}
        </span>
      </div>

      <div className={styles.cardsRow}>
        {loading ? (
          [0,1,2].map(i => <div key={i} className={styles.skeleton} />)
        ) : phones.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>No phones match your filters. Try adjusting your budget, brand, or year.</p>
          </div>
        ) : phones.map((p, i) => (
          <PhoneCard key={p._id} phone={p} rank={i}
            badge={BADGES[i]}
            isTop={i === 0}
            inCompare={compareIds.includes(p._id)}
            inWishlist={wishlistIds.has(p._id)}
            onCompare={() => toggleCompare(p._id)}
            onWishlist={() => toggleWishlist(p._id)}
            onDetails={() => navigate(`/phones/${p._id}`)}
          />
        ))}
      </div>

      {pages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <button key={n}
              className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
              onClick={() => fetchPhones(filters, n)}>
              {n}
            </button>
          ))}
        </div>
      )}

      {compareIds.length >= 2 && (
        <div className={styles.compareBar}>
          <span className={styles.compareBarText}>
            <strong>{compareIds.length}</strong> phones selected for comparison
          </span>
          <button className={styles.compareBtn}
            onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}>
            Compare now →
          </button>
          <button className={styles.clearCompare} onClick={() => setCompareIds([])}>Clear</button>
        </div>
      )}
    </div>
  );
}

function PhoneCard({ phone, rank, badge, isTop, inCompare, inWishlist, onCompare, onWishlist, onDetails }) {
  const ORB_COLS = [
    ['rgba(129,140,248,0.35)', 'rgba(167,139,250,0.2)'],
    ['rgba(56,189,248,0.18)', 'rgba(129,140,248,0.12)'],
    ['rgba(99,102,241,0.18)', 'rgba(139,92,246,0.12)'],
  ];
  const orbs = ORB_COLS[rank] || ORB_COLS[2];

  return (
    <div className={`${styles.card} ${isTop ? styles.cardTop : ''}`} onClick={onDetails}>
      <div className={styles.cardBand}>
        <div className={styles.bandBg}>
          <div className={styles.orb} style={{ width: 140, height: 140, background: orbs[0], top: -40, left: -20 }} />
          <div className={styles.orb} style={{ width: 80, height: 80, background: orbs[1], bottom: -20, right: 0 }} />
        </div>
        <div className={`${styles.bandBadge} ${isTop ? styles.badgeGold : styles.badgeSilver}`}>
          {isTop ? '★ ' : ''}{badge || 'Pick'}
        </div>
        <div className={styles.bandRank}>#{rank + 1}</div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardBrand}>{phone.brand}</div>
        <div className={styles.cardName}>{phone.name}</div>
        <div className={styles.cardMeta}>
          {phone.priceUsd ? <strong>${phone.priceUsd.toLocaleString()}</strong> : <strong>–</strong>}
          {phone.releaseYear && <span> · {phone.releaseYear}</span>}
        </div>

        <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
          <button className={`${styles.btnDetails} ${isTop ? styles.btnDetailsTop : ''}`} onClick={onDetails}>
            View Details →
          </button>
          <button
            className={`${styles.btnIcon} ${inCompare ? styles.btnIconActive : ''}`}
            onClick={onCompare}
            title="Add to compare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M8 21H5a2 2 0 0 0-2-2v-3M21 16v3a2 2 0 0 0-2 2h-3"/></svg>
          </button>
          <button
            className={`${styles.btnIcon} ${inWishlist ? styles.btnIconSaved : ''}`}
            onClick={onWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={inWishlist ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
