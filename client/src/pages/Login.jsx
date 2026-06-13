import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      if (user.role === 'admin') navigate('/admin');
      else if (!user.hasCompletedSurvey) navigate('/survey');
      else navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className={styles.auth}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
            />
          </div>
          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={e => setForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
            />
            <span>Remember me for 7 days</span>
          </label>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/forgot-password">Forgot password?</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
