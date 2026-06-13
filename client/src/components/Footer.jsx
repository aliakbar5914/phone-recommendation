import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.186 6.839 9.505.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.205 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.name}>Phone<span>Finder</span></span>
          <p className={styles.tagline}>Smart smartphone discovery platform</p>
        </div>

        {/* Nav links */}
        <div className={styles.links}>
          <div className={styles.linksTitle}>Platform</div>
          <Link to="/explore" className={styles.link}>Find a Phone</Link>
          <Link to="/survey"  className={styles.link}>Take Survey</Link>
          <Link to="/compare" className={styles.link}>Compare</Link>
          <Link to="/about"   className={styles.link}>About</Link>
          <Link to="/contact" className={styles.link}>Contact</Link>
        </div>

        {/* Contact + Socials */}
        <div className={styles.links}>
          <div className={styles.linksTitle}>Contact</div>
          <a href="mailto:support@phonefinder.app" className={styles.link}>
            <MailIcon /> support@phonefinder.app
          </a>
          <div className={styles.socials}>
            <a href="https://github.com/Ibrahim-umair/Web-Project" target="_blank" rel="noreferrer" className={styles.socialBtn} aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialBtn} aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>© {new Date().getFullYear()} PhoneFinder. Built for educational purposes.</span>
        <span className={styles.copy} style={{ opacity: 0.5 }}>Data sourced from GSMArena</span>
      </div>
    </footer>
  );
}
