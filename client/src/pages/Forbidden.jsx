import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ErrorPage.module.css';

export default function Forbidden() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.glow} style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.12), transparent)' }} />
      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div className={styles.code} style={{ color: '#ef4444' }}>403</div>
        <h1 className={styles.title}>Access Denied</h1>
        <p className={styles.desc}>
          You don't have permission to access this page.
          {user ? ' This area requires elevated privileges.' : ' Please log in with an authorised account.'}
        </p>
        <div className={styles.actions}>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
