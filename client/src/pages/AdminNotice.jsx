import { Link } from 'react-router-dom';
import styles from './ErrorPage.module.css';

export default function AdminNotice() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div className={styles.code} style={{ color: 'var(--accent)' }}>Admin Account</div>
        <h1 className={styles.title}>User Features Only</h1>
        <p className={styles.desc}>
          This area is for registered users. As an admin, your workspace is the
          <strong> Admin Console</strong> — where you manage phones, users, and platform insights.
        </p>
        <div className={styles.actions}>
          <Link to="/admin" className="btn btn-primary">
            Go to Admin Console
          </Link>
          <Link to="/" className="btn btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
