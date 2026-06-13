import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

/* ── Sidebar SVG icons ───────────────────────────────────── */
const IcoDash    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoPhones  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoUsers   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoInsight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoHome    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoLogout  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NAV_ITEMS = [
  { to: '/admin',         label: 'Dashboard', icon: <IcoDash />,    end: true },
  { to: '/admin/phones',  label: 'Phones',    icon: <IcoPhones /> },
  { to: '/admin/users',   label: 'Users',     icon: <IcoUsers /> },
  { to: '/admin/insights',label: 'Insights',  icon: <IcoInsight /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className={styles.adminRoot}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <a href="/" className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoMark}>Phone<span>Finder</span></div>
          <div className={styles.sidebarLogoSub}>Admin Console</div>
        </a>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>Platform</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navLinkIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className={styles.navSection}>Navigation</div>
          <a href="/" className={styles.navLink}>
            <span className={styles.navLinkIcon}><IcoHome /></span>
            Back to Site
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatar}>{user?.name?.[0]?.toUpperCase() ?? 'A'}</div>
            <div>
              <div className={styles.sidebarUserName}>{user?.name ?? 'Admin'}</div>
              <div className={styles.sidebarUserRole}>Administrator</div>
            </div>
          </div>
          <button className={`${styles.navLink}`} style={{ marginTop: 4, color: 'var(--muted)' }} onClick={handleLogout}>
            <span className={styles.navLinkIcon}><IcoLogout /></span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────── */}
      <main className={styles.adminMain}>
        <div className={styles.adminContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
