import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPhone } from '../api/phoneApi';
import { addToShortlist } from '../api/shortlistApi';
import { useCompare } from '../context/CompareContext';
import { formatPrice, tierColor } from '../utils/formatters';
import BrandLogo from '../components/BrandLogo';
import styles from './PhoneDetail.module.css';

/* ── Inline SVG icons (no emoji) ────────────────────────── */
const IcoNetwork   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>;
const IcoCalendar  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoBody      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="12" x2="15" y2="12"/></svg>;
const IcoDisplay   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IcoPlatform  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
const IcoMemory    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>;
const IcoCamera    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoBattery   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>;
const IcoConnect   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg>;
const IcoBookmark  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IcoScale     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M4 12l8-8 8 8"/></svg>;
const IcoExtLink   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

const SPEC_SECTIONS = (phone) => [
  { icon: IcoNetwork,  title: 'Network',      rows: [['Technology', phone.networkTechnology], ['5G Support', phone.supports5G ? 'Yes' : 'No']] },
  { icon: IcoCalendar, title: 'Launch',       rows: [['Announced', phone.releaseText], ['Year', phone.releaseYear]] },
  { icon: IcoBody,     title: 'Body',         rows: [['Dimensions', phone.bodyDimensions], ['Weight', phone.weight], ['SIM', phone.sim], ['Dual SIM', phone.hasDualSim ? 'Yes' : 'No']] },
  { icon: IcoDisplay,  title: 'Display',      rows: [['Type', phone.displayType], ['Size', phone.displaySize], ['Resolution', phone.displayResolution], ['Refresh Rate', phone.refreshRate ? `${phone.refreshRate} Hz` : null]] },
  { icon: IcoPlatform, title: 'Platform',     rows: [['OS', phone.os], ['Chipset', phone.chipset], ['Chipset Tier', phone.chipsetTier], ['CPU', phone.cpu], ['GPU', phone.gpu]] },
  { icon: IcoMemory,   title: 'Memory',       rows: [['Internal', phone.memoryInternal], ['RAM Options', phone.ramOptions?.join(', ')], ['Storage Options', phone.storageOptions?.join(', ')]] },
  { icon: IcoCamera,   title: 'Camera',       rows: [['Main Camera', phone.mainCamera], ['Features', phone.mainCameraFeatures], ['Video', phone.mainCameraVideo], ['Camera Tier', phone.cameraTier], ['Selfie', phone.selfieCamera]] },
  { icon: IcoBattery,  title: 'Battery',      rows: [['Type', phone.batteryType], ['Capacity', phone.batteryMah ? `${phone.batteryMah} mAh` : null], ['Tier', phone.batteryTier], ['Charging', phone.charging]] },
  { icon: IcoConnect,  title: 'Connectivity', rows: [['NFC', phone.nfc], ['USB', phone.usb], ['3.5mm Jack', phone.headphoneJack]] },
];

export default function PhoneDetail() {
  const { id } = useParams();
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  useEffect(() => {
    setLoading(true);
    getPhone(id).then(res => setPhone(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleShortlist = async () => {
    try { await addToShortlist(phone._id); setShortlisted(true); } catch {}
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!phone)  return <div className="empty-state"><h3>Phone not found</h3></div>;

  const inCompare = isInCompare(phone._id);

  return (
    <div className={styles.detail}>
      <div className={styles.container}>
        <Link to="/explore" className={styles.back}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="14" height="14">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Explore
        </Link>

        <div className={styles.hero}>
          {/* Brand logo in place of colored square */}
          <div className={styles.imageArea}>
            <BrandLogo brand={phone.brand} size="xl" />
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.brandRow}>
              <span className={styles.brand}>{phone.brand}</span>
              {phone.chipsetTier && phone.chipsetTier !== 'Unknown' && (
                <span className={styles.tier} style={{ background: tierColor(phone.chipsetTier) + '22', color: tierColor(phone.chipsetTier) }}>
                  {phone.chipsetTier}
                </span>
              )}
            </div>
            <h1 className={styles.phoneName}>{phone.phoneName}</h1>
            <div className={styles.price}>{formatPrice(phone.priceApprox, phone.priceText)}</div>

            {phone.categoryTags?.length > 0 && (
              <div className={styles.tags}>
                {phone.categoryTags.map(t => <span key={t} className="badge badge-accent">{t}</span>)}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={`btn ${shortlisted ? 'btn-success' : 'btn-primary'}`}
                onClick={handleShortlist}
                disabled={shortlisted}
              >
                <IcoBookmark />
                {shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              </button>
              <button
                className={`btn ${inCompare ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => !inCompare && addToCompare(phone)}
                disabled={!inCompare && !canAddMore}
              >
                <IcoScale />
                {inCompare ? 'In Compare' : 'Add to Compare'}
              </button>
              {phone.sourceUrl && (
                <a href={phone.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                  <IcoExtLink />
                  GSMArena
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Spec Sections */}
        <div className={styles.specs}>
          {SPEC_SECTIONS(phone).map(section => (
            <div key={section.title} className={styles.specSection}>
              <h2 className={styles.specTitle}>
                <span className={styles.specTitleIcon}><section.icon /></span>
                {section.title}
              </h2>
              <div className={styles.specTable}>
                {section.rows.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className={styles.specRow}>
                    <span className={styles.specLabel}>{label}</span>
                    <span className={styles.specValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
