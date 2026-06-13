import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMe, loginUser, registerUser, logoutUser } from '../api/authApi';

const AuthContext = createContext(null);

// Idle timeout: 30 minutes of no activity → auto-logout
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef(null);

  /* ── Restore session on mount ─────────────────────────── */
  useEffect(() => {
    getMe()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /* ── Idle logout ──────────────────────────────────────── */
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(async () => {
      // Auto-logout after IDLE_TIMEOUT_MS of inactivity
      await logoutUser().catch(() => {});
      setUser(null);
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!user) {
      // Clear timer when logged out
      if (idleTimer.current) clearTimeout(idleTimer.current);
      return;
    }

    // Start timer; reset on any user activity
    resetIdleTimer();
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [user, resetIdleTimer]);

  /* ── Auth actions ─────────────────────────────────────── */
  const login = useCallback(async (email, password, rememberMe = false) => {
    const res = await loginUser({ email, password, rememberMe });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => setUser(prev => ({ ...prev, ...updated })), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
