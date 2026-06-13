import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { comparePhones } from '../api/compareApi';
import BrandLogo from '../components/BrandLogo';
import styles from './Compare.module.css';

const COMPARE_FIELDS = [
  { label: 'Price',         fn: p => p.priceApprox ? `$${p.priceApprox.toLocaleString()}` : p.priceText?.split('/')[0]?.trim() || '–' },
  { label: 'Launch Year',   key: 'releaseYear' },
  { label: 'Network',       key: 'networkTechnology' },
  { label: 'OS',            key: 'os' },
  { label: 'Chipset',       key: 'chipset' },
  { label: 'Chipset Tier',  key: 'chipsetTier' },
  { label: 'CPU',           key: 'cpu' },
  { label: 'GPU',           key: 'gpu' },
  { label: 'RAM / Storage', key: 'memoryInternal' },
  { label: 'Display Type',  key: 'displayType' },
  { label: 'Display Size',  key: 'displaySize' },
  { label: 'Resolution',    key: 'displayResolution' },
  { label: 'Refresh Rate',  fn: p => p.refreshRate ? `${p.refreshRate} Hz` : '–' },
  { label: 'Main Camera',   key: 'mainCamera' },
  { label: 'Camera Tier',   key: 'cameraTier' },
  { label: 'Video',         key: 'mainCameraVideo' },
  { label: 'Selfie',        key: 'selfieCamera' },
  { label: 'Battery',       fn: p => p.batteryMah ? `${p.batteryMah.toLocaleString()} mAh` : '–' },
  { label: 'Battery Tier',  key: 'batteryTier' },
  { label: 'Charging',      key: 'charging' },
  { label: 'NFC',           key: 'nfc' },
  { label: '5G',            fn: p => p.supports5G ? 'Yes ✅' : 'No' },
  { label: 'Dual SIM',      fn: p => p.hasDualSim  ? 'Yes ✅' : 'No' },
  { label: 'USB',           key: 'usb' },
  { label: 'Weight',        key: 'weight' },
  { label: 'Dimensions',    key: 'bodyDimensions' },
];

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const navigate = useNavigate();

  const phones = fullData || compareList;

  const handleCompare = async () => {
    if (compareList.length < 2) return;
    setLoading(true); setError('');
    try {
      const res = await comparePhones(compareList.map(p => p._id));
      setFullData(res.data);
    } catch {
      setError('Could not load full specs. Showing cached data.');
      setFullData(compareList);
    }
    setLoading(false);
  };

  const val = (phone, field) => {
    if (field.fn) return field.fn(phone) || '–';
    return phone[field.key] || '–';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className="eyebrow">Side by side</div>
            <h1 className={styles.title}>Compare Phones</h1>
            <p className={styles.sub}>Add 2–3 phones from Explore to compare every spec</p>
          </div>
          {compareList.length > 0 && (
            <button className="btn btn-ghost" onClick={clearCompare}>Clear All</button>
          )}
        </div>

        {/* Selection slots */}
        <div className={styles.slots}>
          {compareList.map(phone => (
            <div key={phone._id} className={styles.slot}>
              <BrandLogo brand={phone.brand} size="md" />
              <div className={styles.slotInfo}>
                <div className={styles.slotName}>{phone.phoneName}</div>
                <div className={styles.slotBrand}>{phone.brand}</div>
              </div>
              <button className={styles.removeBtn} onClick={() => { removeFromCompare(phone._id); setFullData(null); }}>✕</button>
            </div>
          ))}
          {compareList.length < 3 && (
            <div className={styles.addSlot} onClick={() => navigate('/explore')}>
              <span className={styles.addIcon}>+</span>
              <span className={styles.addLabel}>Add a phone</span>
            </div>
          )}
          {[...Array(Math.max(0, 3 - compareList.length - 1))].map((_, i) => (
            <div key={i} className={`${styles.addSlot} ${styles.addSlotGhost}`} />
          ))}
        </div>

        {/* CTA */}
        {!fullData && (
          <div className={styles.cta}>
            <button
              className="btn btn-primary"
              disabled={compareList.length < 2 || loading}
              onClick={handleCompare}
            >
              {loading ? 'Loading specs…' : `Compare ${compareList.length} Phone${compareList.length !== 1 ? 's' : ''}`}
            </button>
            {compareList.length < 2 && (
              <span className={styles.ctaHint}>
                Add at least 2 phones from <Link to="/explore">Explore</Link>
              </span>
            )}
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {/* Comparison table */}
        {fullData && phones.length > 0 && (
          <>
            <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => setFullData(null)}>← Back to selection</button>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.specCol}>Spec</th>
                    {phones.map(phone => (
                      <th key={phone._id} className={styles.phoneCol}>
                        <div className={styles.thInner}>
                          <BrandLogo brand={phone.brand} size="md" />
                          <div>
                            <div className={styles.thName}>{phone.phoneName}</div>
                            <div className={styles.thBrand}>{phone.brand}</div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FIELDS.map(field => (
                    <tr key={field.label} className={styles.row}>
                      <td className={styles.specCell}>{field.label}</td>
                      {phones.map(phone => (
                        <td key={phone._id} className={styles.valCell}>{val(phone, field)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className={styles.row}>
                    <td className={styles.specCell}>Source</td>
                    {phones.map(phone => (
                      <td key={phone._id} className={styles.valCell}>
                        {phone.sourceUrl
                          ? <a href={phone.sourceUrl} target="_blank" rel="noreferrer">GSMArena →</a>
                          : '–'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {compareList.length === 0 && !fullData && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 44, height: 44, marginBottom: 12, color: 'var(--muted)' }}>
              <line x1="12" y1="3" x2="12" y2="21"/><path d="M5 21h14"/><path d="M5 8l7-5 7 5"/><path d="M5 8c0 3.31 2.24 6 5 6.87"/><path d="M19 8c0 3.31-2.24 6-5 6.87"/>
            </svg>
            <h3>Nothing to compare yet</h3>
            <p>Go to Explore, open any phone card and click the compare icon.</p>
            <Link to="/explore" className="btn btn-primary" style={{ marginTop: 20 }}>Go to Explore →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
