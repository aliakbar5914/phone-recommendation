import { useEffect, useRef } from 'react';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useInactivityLogout(onLogout, enabled = true) {
  const timer = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onLogout, TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [enabled, onLogout]);
}
