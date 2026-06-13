import { useState, useEffect } from 'react';
import api from '../../api/axios';
import BrandLogo from '../../components/BrandLogo';
import styles from './Admin.module.css';

/* ── Icons ─────────────────────────────────────────────── */
const IcoEdit    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoStar    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoEye     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoSearch  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IcoPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoChevL   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>;

/* ── Helpers ─────────────────────────────────────────────── */
const TIER_CLASS = { Flagship: styles.badgeFlagship, 'Upper Midrange': styles.badgeMid, Midrange: styles.badgeMid, Entry: styles.badgeEntry };

function TierBadge({ tier }) {
  if (!tier || tier === 'Unknown') return <span className={`${styles.badge} ${styles.badgeHidden}`}>–</span>;
  return <span className={`${styles.badge} ${TIER_CLASS[tier] || styles.badgeEntry}`}>{tier}</span>;
}

const BRANDS_FILTER = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Motorola', 'Sony'];
const TIER_FILTER   = ['All', 'Flagship', 'Upper Midrange', 'Midrange', 'Entry'];
const PER_PAGE = 15;
const EMPTY_FORM = { phoneName: '', brand: '', releaseYear: '', priceApprox: '' };

export default function ManagePhones() {
  const [phones,   setPhones]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [brandF,   setBrandF]   = useState('All');
  const [tierF,    setTierF]    = useState('All');
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(null);  // 'edit' | null
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/phones', { params: { limit: 500, sort: 'newest' } });
    setPhones(res.data.phones);
    setLoading(false);
  };

  /* Filter */
  useEffect(() => {
    const q = search.toLowerCase();
    const f = phones.filter(p =>
      (p.phoneName.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) &&
      (brandF === 'All' || p.brand === brandF) &&
      (tierF === 'All' || p.chipsetTier === tierF)
    );
    setFiltered(f);
    setPage(1);
  }, [search, brandF, tierF, phones]);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setEditing(null); setModal('edit'); };
  const openEdit = (p) => {
    setForm({ phoneName: p.phoneName, brand: p.brand, releaseYear: p.releaseYear || '', priceApprox: p.priceApprox || '' });
    setEditing(p); setErrors({}); setModal('edit');
  };

  const validate = () => {
    const e = {};
    if (!form.phoneName.trim()) e.phoneName = 'Required';
    if (!form.brand.trim())     e.brand     = 'Required';
    return e;
  };

  const save = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        phoneName:   form.phoneName.trim(),
        brand:       form.brand.trim(),
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        priceApprox: form.priceApprox ? Number(form.priceApprox) : undefined,
      };
      if (editing) {
        const res = await api.put(`/phones/${editing._id}`, payload);
        setPhones(ps => ps.map(p => p._id === editing._id ? { ...p, ...res.data } : p));
      } else {
        const res = await api.post('/phones', payload);
        setPhones(ps => [res.data, ...ps]);
      }
      setModal(null);
    } catch (err) {
      setErrors({ phoneName: err.response?.data?.message || 'Save failed' });
    } finally { setSaving(false); }
  };

  const deletePhone = async (p) => {
    if (!confirm(`Delete "${p.phoneName}"? This cannot be undone.`)) return;
    await api.delete(`/phones/${p._id}`);
    setPhones(ps => ps.filter(x => x._id !== p._id));
  };

  const toggleFeatured = async (p) => {
    const res = await api.patch(`/phones/${p._id}`, { isFeatured: !p.isFeatured }).catch(() => null);
    if (res) setPhones(ps => ps.map(x => x._id === p._id ? { ...x, isFeatured: !x.isFeatured } : x));
  };

  const toggleHidden = async (p) => {
    const res = await api.patch(`/phones/${p._id}`, { isHidden: !p.isHidden }).catch(() => null);
    if (res) setPhones(ps => ps.map(x => x._id === p._id ? { ...x, isHidden: !x.isHidden } : x));
  };

  const setF = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: undefined })); };

  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pagNums    = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : [1, 2, '…', page, '…', totalPages - 1, totalPages].filter((v, i, a) => a.indexOf(v) === i && (typeof v === 'number' ? v > 0 && v <= totalPages : true));

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>Phones</div>
        <div className={styles.pageSub}>{phones.length} phones in catalog</div>
      </div>

      <div className={styles.tableCard}>
        {/* Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.tableSearch}>
            <IcoSearch />
            <input placeholder="Search phones or brand…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={styles.filterSelect} value={brandF} onChange={e => setBrandF(e.target.value)}>
            {BRANDS_FILTER.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className={styles.filterSelect} value={tierF} onChange={e => setTierF(e.target.value)}>
            {TIER_FILTER.map(t => <option key={t}>{t}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={openAdd}>
            <IcoPlus /> Add Phone
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Phone</th>
                <th>Brand</th>
                <th>Year</th>
                <th>Price</th>
                <th>Tier</th>
                <th>Saves</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }, (__, j) => (
                      <td key={j}><div className={styles.skelBlock} style={{ height: 16, width: j === 0 ? 140 : 60, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan="8">
                  <div className={styles.emptyState}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="40" height="40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <p>No phones match your filters</p>
                  </div>
                </td></tr>
              ) : paged.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BrandLogo brand={p.brand} size="sm" />
                      <span className={styles.phoneNameCell}>{p.phoneName}</span>
                    </div>
                  </td>
                  <td>{p.brand}</td>
                  <td>{p.releaseYear || '–'}</td>
                  <td>{p.priceApprox ? `$${p.priceApprox.toLocaleString()}` : '–'}</td>
                  <td><TierBadge tier={p.chipsetTier} /></td>
                  <td style={{ fontWeight: 700 }}>{p.wishlistCount || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.isFeatured && <span className={`${styles.badge} ${styles.badgeFeatured}`}>Featured</span>}
                      {p.isHidden   && <span className={`${styles.badge} ${styles.badgeHidden}`}>Hidden</span>}
                      {!p.isFeatured && !p.isHidden && <span className={`${styles.badge} ${styles.badgeUser}`}>Default</span>}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button className={`${styles.iconBtn} ${styles.iconBtnAccent}`} title="Edit" onClick={() => openEdit(p)}><IcoEdit /></button>
                      <button className={`${styles.iconBtn} ${p.isFeatured ? styles.iconBtnAccent : ''}`} title={p.isFeatured ? 'Unfeature' : 'Feature'} onClick={() => toggleFeatured(p)}><IcoStar /></button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} title={p.isHidden ? 'Show' : 'Hide'} onClick={() => toggleHidden(p)}>
                        {p.isHidden ? <IcoEye /> : <IcoEyeOff />}
                      </button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={() => deletePhone(p)}><IcoTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={`${styles.pageBtn} ${page === 1 ? styles.pageBtnDisabled : ''}`} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <IcoChevL />
            </button>
            {pagNums.map((n, i) => n === '…'
              ? <span key={`e${i}`} className={styles.pageBtn} style={{ pointerEvents: 'none' }}>…</span>
              : <button key={n} className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(n)}>{n}</button>
            )}
            <button className={`${styles.pageBtn} ${page === totalPages ? styles.pageBtnDisabled : ''}`} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <IcoChevR />
            </button>
          </div>
        )}
      </div>

      {/* ── Edit / Add Modal ─────────────────────────────── */}
      {modal === 'edit' && (
        <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>{editing ? 'Edit Phone' : 'Add Phone'}</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Phone Name *</label>
                <input value={form.phoneName} onChange={setF('phoneName')} placeholder="e.g. iPhone 16 Pro" />
                {errors.phoneName && <div className="form-error">{errors.phoneName}</div>}
              </div>
              <div className="form-group">
                <label>Brand *</label>
                <input value={form.brand} onChange={setF('brand')} placeholder="e.g. Apple" />
                {errors.brand && <div className="form-error">{errors.brand}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Release Year</label>
                  <input type="number" value={form.releaseYear} onChange={setF('releaseYear')} placeholder="2025" />
                </div>
                <div className="form-group">
                  <label>Price (USD)</label>
                  <input type="number" value={form.priceApprox} onChange={setF('priceApprox')} placeholder="999" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Phone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
