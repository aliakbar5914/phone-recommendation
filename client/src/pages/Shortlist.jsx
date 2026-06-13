import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getShortlist, removeFromShortlist } from '../api/shortlistApi';
import { useCompare } from '../context/CompareContext';
import BrandLogo from '../components/BrandLogo';
import styles from './Shortlist.module.css';

export default function Shortlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  useEffect(() => {
    getShortlist()
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (phoneId) => {
    try {
      await removeFromShortlist(phoneId);
      setItems(prev => prev.filter(i => (i.phoneId?._id || i.phoneId) !== phoneId));
    } catch {}
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className={styles.shortlist}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className="eyebrow">Saved phones</div>
          <h1>My Shortlist</h1>
          <p>{items.length} phone{items.length !== 1 ? 's' : ''} saved</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 44, height: 44, marginBottom: 12, color: 'var(--muted)' }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <h3>Your shortlist is empty</h3>
            <p>Start exploring phones and save your favorites here.</p>
            <Link to="/explore" className="btn btn-primary" style={{ marginTop: 20 }}>
              Explore Phones →
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => {
              const phone = item.phoneId;
              if (!phone) return null;
              const inCompare = isInCompare(phone._id);
              const price = phone.priceApprox ? `$${phone.priceApprox.toLocaleString()}` : phone.priceText?.split('/')[0]?.trim() || '–';

              return (
                <div key={item._id} className={styles.card}>
                  <div className={styles.imageArea}>
                    <BrandLogo brand={phone.brand} size="lg" />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.brand}>{phone.brand}</div>
                    <h3><Link to={`/phones/${phone._id}`}>{phone.phoneName}</Link></h3>
                    <div className={styles.price}>{price}</div>
                    {phone.categoryTags?.length > 0 && (
                      <div className={styles.tags}>
                        {phone.categoryTags.slice(0, 3).map(t => (
                          <span key={t} className="badge badge-accent">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className={styles.actions}>
                      <button
                        className={`btn btn-secondary btn-sm`}
                        onClick={() => !inCompare && addToCompare(phone)}
                        disabled={!inCompare && !canAddMore}
                      >
                        {inCompare ? '⚖️ In Compare' : '⚖️ Compare'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(phone._id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
