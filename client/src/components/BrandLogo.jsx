import { getBrandSvg, getBrandFallback, getBrandStyle } from '../utils/brandPlaceholders';
import styles from './BrandLogo.module.css';

/**
 * BrandLogo — shows SVG brand icon when available, falls back to emoji in a
 * gradient circle. size: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function BrandLogo({ brand, size = 'md', className = '' }) {
  const svg = getBrandSvg(brand);
  const fallback = getBrandFallback(brand);
  const { bg } = getBrandStyle(brand);

  return (
    <div
      className={`${styles.logo} ${styles[size]} ${className}`}
      style={{ background: svg ? 'var(--surface2)' : bg }}
      title={brand}
    >
      {svg ? (
        <img
          src={svg}
          alt={brand}
          className={styles.img}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
        />
      ) : null}
      <span
        className={styles.fallback}
        style={{ display: svg ? 'none' : 'block' }}
        aria-hidden="true"
      >
        {fallback}
      </span>
    </div>
  );
}
