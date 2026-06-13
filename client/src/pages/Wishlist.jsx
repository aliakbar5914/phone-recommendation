import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './Wishlist.module.css';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/wishlist')
      .then(res => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (phoneId) => {
    await api.delete(`/wishlist/${phoneId}`);
    setItems(items => items.filter(i => i.phoneId._id !== phoneId));
  };

  const toggleCompare = (id) => {
    setCompareIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : ids.length < 3 ? [...ids, id] : ids);
  };

  if (loading) return (
    <div className="page">
      <div className={styles.grid}>
        {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ marginBottom: 36 }}>
        <div className="eyebrow">Your saves</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Wishlist</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
          {items.length} saved phone{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
          <h2>Your wishlist is empty</h2>
          <p>Browse phones and hit the bookmark icon to save them here.</p>
          <Link to="/find" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Find phones →</Link>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {items.map(item => {
              const p = item.phoneId;
              const inCompare = compareIds.includes(p._id);
              return (
                <div key={item._id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <div className={styles.brand}>{p.brand}</div>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.meta}>
                        {p.priceUsd && <span>${p.priceUsd.toLocaleString()}</span>}
                        {p.releaseYear && <span> · {p.releaseYear}</span>}
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => remove(p._id)} title="Remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <div className={styles.actions}>
                    <Link to={`/phones/${p._id}`} className={styles.detailBtn}>View Details →</Link>
                    <button
                      className={`${styles.compareBtn} ${inCompare ? styles.compareBtnActive : ''}`}
                      onClick={() => toggleCompare(p._id)}>
                      {inCompare ? '✓ Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {compareIds.length >= 2 && (
            <div className={styles.compareBar}>
              <span style={{ fontSize: 13, color: 'var(--muted2)' }}>
                <strong style={{ color: 'var(--text)' }}>{compareIds.length}</strong> phones selected
              </span>
              <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}
                onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}>
                Compare now →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
