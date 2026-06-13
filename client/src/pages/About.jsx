import styles from './About.module.css';

const IcoTarget   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoDatabase = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IcoCode     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;

export default function About() {
  return (
    <div className={styles.about}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className="eyebrow">The platform</div>
          <h1>About Phone Finder</h1>
          <p>A data-driven smartphone decision-support platform</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionIcon}><IcoTarget /></span> Our Mission</h2>
            <p>
              Phone Finder is not an e-commerce store. It's a <strong>smartphone exploration,
              filtering, and comparison platform</strong> — built to help you make informed
              decisions based on real specifications and data. No sales, no bias.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionIcon}><IcoSettings /></span> How It Works</h2>
            <ul>
              <li><strong>Survey-Driven:</strong> Answer a short preference quiz to get personalized results.</li>
              <li><strong>Smart Filtering:</strong> Filter by chipset tier, camera, battery, price, 5G, NFC and more.</li>
              <li><strong>Side-by-Side Comparison:</strong> Compare 2–3 devices across 25+ specification categories.</li>
              <li><strong>Shortlisting:</strong> Save your favorites and revisit them anytime.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionIcon}><IcoDatabase /></span> Data Source</h2>
            <p>
              Our database contains <strong>223 smartphones</strong> imported from GSMArena
              with <strong>73 specification columns</strong>. Each phone is automatically classified
              into chipset tiers, camera tiers, battery tiers, and category tags using rule-based heuristics.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><span className={styles.sectionIcon}><IcoCode /></span> Tech Stack</h2>
            <div className={styles.techGrid}>
              {[['React', 'Frontend'], ['Express.js', 'Backend'], ['MongoDB', 'Database'], ['JWT + bcrypt', 'Auth']].map(([name, role]) => (
                <div key={name} className={styles.techCard}>
                  <strong>{name}</strong>
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
