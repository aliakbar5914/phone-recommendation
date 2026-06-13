import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

/* ── Icons ─────────────────────────────────────────────── */
const IcoSearch  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IcoShield  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoUser    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoToggleOn  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="4" fill="currentColor"/></svg>;
const IcoToggleOff = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="4" fill="currentColor"/></svg>;
const IcoChevL   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>;

const ROLE_FILTER   = ['All', 'user', 'admin'];
const STATUS_FILTER = ['All', 'Active', 'Inactive'];
const PER_PAGE = 20;

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleF,    setRoleF]    = useState('All');
  const [statusF,  setStatusF]  = useState('All');
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    api.get('/users').then(res => { setUsers(res.data); setFiltered(res.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const f = users.filter(u =>
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleF   === 'All' || u.role === roleF) &&
      (statusF === 'All' || (statusF === 'Active' ? u.isActive : !u.isActive))
    );
    setFiltered(f);
    setPage(1);
  }, [search, roleF, statusF, users]);

  /* Guard: can't deactivate self or last admin */
  const adminCount = users.filter(u => u.role === 'admin').length;

  const toggleActive = async (u) => {
    if (u._id === me?._id) return;
    const res = await api.patch(`/users/${u._id}`, { isActive: !u.isActive }).catch(() => null);
    if (res) setUsers(us => us.map(x => x._id === u._id ? res.data : x));
  };

  const toggleRole = async (u) => {
    if (u._id === me?._id) return;
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (u.role === 'admin' && adminCount <= 1) {
      alert('Cannot remove the last admin.');
      return;
    }
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    const res = await api.patch(`/users/${u._id}`, { role: newRole }).catch(() => null);
    if (res) setUsers(us => us.map(x => x._id === u._id ? res.data : x));
  };

  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>Users</div>
        <div className={styles.pageSub}>{users.length} total members</div>
      </div>

      <div className={styles.tableCard}>
        {/* Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.tableSearch}>
            <IcoSearch />
            <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={styles.filterSelect} value={roleF} onChange={e => setRoleF(e.target.value)}>
            {ROLE_FILTER.map(r => <option key={r}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select className={styles.filterSelect} value={statusF} onChange={e => setStatusF(e.target.value)}>
            {STATUS_FILTER.map(s => <option key={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Survey</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }, (__, j) => (
                    <td key={j}><div className={styles.skelBlock} style={{ height: 14, width: j === 0 ? 160 : 70, borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan="6">
                  <div className={styles.emptyState}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="40" height="40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <p>No users match your search</p>
                  </div>
                </td></tr>
              ) : paged.map(u => {
                const isMe       = u._id === me?._id;
                const isLastAdmin= u.role === 'admin' && adminCount <= 1;
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={styles.userAvatar}>{u.name[0].toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>
                            {u.name}
                            {isMe && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 6, fontWeight: 700 }}>you</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {u.role === 'admin' ? <IcoShield /> : <IcoUser />}
                        </span>
                        &nbsp;{u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${u.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${u.hasCompletedSurvey ? styles.badgeActive : styles.badgeHidden}`}>
                        {u.hasCompletedSurvey ? 'Done' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        {/* Toggle role */}
                        <button
                          className={`${styles.iconBtn} ${u.role === 'admin' ? styles.iconBtnAccent : ''}`}
                          title={u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          onClick={() => toggleRole(u)}
                          disabled={isMe || isLastAdmin}
                          style={isMe || isLastAdmin ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                        >
                          <IcoShield />
                        </button>
                        {/* Toggle active */}
                        <button
                          className={`${styles.iconBtn} ${u.isActive ? styles.iconBtnDanger : styles.iconBtnSuccess}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleActive(u)}
                          disabled={isMe}
                          style={isMe ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                        >
                          {u.isActive ? <IcoToggleOn /> : <IcoToggleOff />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={`${styles.pageBtn} ${page === 1 ? styles.pageBtnDisabled : ''}`} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><IcoChevL /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className={`${styles.pageBtn} ${page === totalPages ? styles.pageBtnDisabled : ''}`} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><IcoChevR /></button>
          </div>
        )}
      </div>
    </>
  );
}
