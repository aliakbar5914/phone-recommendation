import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { getBrandStyle } from '../utils/brandPlaceholders';
import { formatPrice, tierColor } from '../utils/formatters';
import styles from './PhoneCard.module.css';

export default function PhoneCard({ phone, onShortlist, isShortlisted }) {
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const brandStyle = getBrandStyle(phone.brand);
  const inCompare = isInCompare(phone._id);

  const handleCompare = (e) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(phone._id);
    } else if (canAddMore) {
      addToCompare(phone);
    }
  };

  const handleShortlist = (e) => {
    e.preventDefault();
    if (onShortlist) onShortlist(phone._id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageArea} style={{ background: brandStyle.bg }}>
        <span className={styles.brandIcon}>{brandStyle.icon}</span>
        <span className={styles.brandLabel}>{phone.brand}</span>
        {phone.chipsetTier && phone.chipsetTier !== 'Unknown' && (
          <span className={styles.tierBadge} style={{ background: tierColor(phone.chipsetTier) + '22', color: tierColor(phone.chipsetTier) }}>
            {phone.chipsetTier}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>
          <Link to={`/phones/${phone._id}`}>{phone.phoneName}</Link>
        </h3>

        <div className={styles.price}>{formatPrice(phone.priceApprox, phone.priceText)}</div>

        <div className={styles.specs}>
          {phone.chipset && <span className={styles.spec}>⚡ {phone.chipset.split('(')[0].trim()}</span>}
          {phone.batteryMah && <span className={styles.spec}>🔋 {phone.batteryMah} mAh</span>}
          {phone.displaySize && <span className={styles.spec}>📐 {phone.displaySize.split(',')[0]}</span>}
          {phone.refreshRate && <span className={styles.spec}>🖥️ {phone.refreshRate}Hz</span>}
        </div>

        {phone.categoryTags?.length > 0 && (
          <div className={styles.tags}>
            {phone.categoryTags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {user && (
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${isShortlisted ? styles.active : ''}`}
              onClick={handleShortlist}
              title={isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}
            >
              {isShortlisted ? '★' : '☆'}
            </button>
            <button
              className={`${styles.actionBtn} ${inCompare ? styles.activeCompare : ''}`}
              onClick={handleCompare}
              title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
              disabled={!inCompare && !canAddMore}
            >
              ⚖️
            </button>
            <Link to={`/phones/${phone._id}`} className={`btn btn-primary btn-sm ${styles.detailsBtn}`}>
              Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
