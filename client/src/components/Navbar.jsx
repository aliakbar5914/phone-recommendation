import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { compareCount } = useCompare();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Phone<span className={styles.accent}>Finder</span>
      </Link>

      <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
        {user && user.role !== 'admin' ? (
          <>
            <Link to="/explore" className={styles.link} onClick={() => setMenuOpen(false)}>Find a Phone</Link>
            <Link to="/survey" className={styles.link} onClick={() => setMenuOpen(false)}>
              {user.hasCompletedSurvey ? 'Preferences' : 'Take Survey'}
            </Link>
            <Link to="/shortlist" className={styles.link} onClick={() => setMenuOpen(false)}>Shortlist</Link>
            <Link to="/compare" className={styles.link} onClick={() => setMenuOpen(false)}>
              Compare {compareCount > 0 && <span className={styles.badge}>{compareCount}</span>}
            </Link>
          </>
        ) : null}
        <Link to="/about" className={styles.link} onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/contact" className={styles.link} onClick={() => setMenuOpen(false)}>Contact</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={styles.link} onClick={() => setMenuOpen(false)}>Admin</Link>
        )}
      </div>

      <div className={styles.right}>
        {user ? (
          <>
            <Link to="/profile" className={styles.link}>Profile</Link>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/signup" className={styles.signupBtn}>Get Started →</Link>
          </>
        )}
      </div>

      <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        <span className={`${styles.bar} ${menuOpen ? styles.barX1 : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barX2 : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barX3 : ''}`} />
      </button>
    </nav>
  );
}
