import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

const PHONE_IMAGE_SRC = '/phone.svg';

const USE_CASES = [
  { icon: '01', title: 'Gaming', desc: 'High-refresh chipsets and gaming features' },
  { icon: '02', title: 'Camera', desc: 'Pro sensors, OIS and night mode' },
  { icon: '03', title: 'Battery', desc: '5000mAh+ endurance champions' },
  { icon: '04', title: 'Student', desc: 'Best value for everyday use' },
  { icon: '05', title: 'Business', desc: '5G, NFC and premium build quality' },
];

const FEATURES = [
  { icon: '01', title: 'Guided Survey', desc: 'Answer a few questions and we match you with ideal phones based on your priorities.' },
  { icon: '02', title: 'Smart Filters', desc: 'Filter by chipset tier, camera, battery, RAM, storage, 5G, NFC, and more.' },
  { icon: '03', title: 'Side-by-Side Compare', desc: 'Compare 2-3 phones across 20+ spec categories simultaneously.' },
  { icon: '04', title: 'Personal Shortlist', desc: 'Save favorites and revisit them anytime with your shortlist.' },
];

export default function Home() {
  const { user } = useAuth();
  const phoneContainerRef = useRef(null);
  const phoneWrapRef = useRef(null);

  useEffect(() => {
    const container = phoneContainerRef.current;
    const wrap = phoneWrapRef.current;
    if (!container || !wrap) return undefined;

    let targetRotateX = 0;
    let targetRotateY = -5;
    let currentRotateX = 0;
    let currentRotateY = -5;
    let hovering = false;
    let tick = 0;
    let frameId;

    const handlePointerMove = (event) => {
      hovering = true;
      const rect = container.getBoundingClientRect();
      targetRotateY = (((event.clientX - rect.left) / rect.width) * 2 - 1) * 22;
      targetRotateX = -(((event.clientY - rect.top) / rect.height) * 2 - 1) * 16;
    };

    const handlePointerLeave = () => {
      hovering = false;
      targetRotateX = 0;
      targetRotateY = -5;
    };

    const animate = () => {
      currentRotateX += (targetRotateX - currentRotateX) * 0.1;
      currentRotateY += (targetRotateY - currentRotateY) * 0.1;

      if (hovering) {
        wrap.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
      } else {
        tick += 0.012;
        wrap.style.transform = `translateY(${Math.sin(tick) * 12}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    animate();

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroEyebrow}>AI-powered recommendations</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.solid}>FIND YOUR</span>
            <span className={styles.outline}>
              <span className={styles.nextWord}>NEXT </span>
              <span className={styles.accentStroke}>PHONE.</span>
            </span>
          </h1>
          <p className={styles.heroSub}>
            Specs, benchmarks, and real reviewer opinions. All analyzed. All in one place.
          </p>
          <div className={styles.ctaRow}>
            {user ? (
              <>
                {!user.hasCompletedSurvey ? (
                  <Link to="/survey" className="btn btn-primary">Take the Survey &rarr;</Link>
                ) : (
                  <Link to="/explore" className="btn btn-primary">Find my phone &rarr;</Link>
                )}
                <Link to="/compare" className="btn btn-ghost">Compare phones</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">Get started &rarr;</Link>
                <Link to="/about" className="btn btn-ghost">See how it works</Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.heroRight} ref={phoneContainerRef}>
          <div className={styles.phoneGlow} />
          <div className={styles.phoneStack} ref={phoneWrapRef}>
            <img className={styles.phoneSvg} src={PHONE_IMAGE_SRC} alt="Phone illustration" draggable="false" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`eyebrow ${styles.sectionEyebrow}`}>How it works</div>
        <div className={styles.sectionTitle}>Everything you need to decide</div>
        <div className={styles.sectionSub}>No fluff. No bias. Just data-driven tools to find your perfect phone.</div>
        <div className={`${styles.featuresGrid} stagger`}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={`eyebrow ${styles.sectionEyebrow}`}>Popular use cases</div>
        <div className={styles.sectionTitle}>What kind of user are you?</div>
        <div className={styles.sectionSub} style={{ marginBottom: 28 }}>We categorize phones so you find the right fit instantly.</div>
        <div className={`${styles.useCasesGrid} stagger`}>
          {USE_CASES.map((useCase) => (
            <div key={useCase.title} className={styles.useCaseCard}>
              <span className={styles.useCaseIcon}>{useCase.icon}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
