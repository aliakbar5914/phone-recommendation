import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (pwForm.newPassword && pwForm.newPassword !== pwForm.confirmPassword) {
      setError('New passwords do not match'); return;
    }
    setLoading(true);
    try {
      const body = { name: form.name, email: form.email };
      if (pwForm.newPassword) {
        body.currentPassword = pwForm.currentPassword;
        body.newPassword = pwForm.newPassword;
      }
      const res = await api.put('/users/me', body);
      updateUser(res.data);
      setMsg('Profile updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="eyebrow">Account</div>
          <h1>Profile Settings</h1>
          <p>Manage your account information</p>
        </div>

        <div className={styles.card}>
          {msg   && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div className={styles.sectionTitle}>Change Password (optional)</div>

            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span>Role</span>
            <span className="badge badge-accent">{user?.role}</span>
          </div>
          <div className={styles.infoRow}>
            <span>Survey completed</span>
            <span>{user?.hasCompletedSurvey ? '✅ Yes' : '⏳ Not yet'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
