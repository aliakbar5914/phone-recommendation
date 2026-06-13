import { useState, useEffect } from 'react';
import api from '../../api/axios';
import BrandLogo from '../../components/BrandLogo';
import styles from './Admin.module.css';

/* ── Icons ─────────────────────────────────────────────── */
const IcoHeart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IcoScale = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M5 21h14M5 8l7-5 7 5M5 8c0 3.31 2.24 6 5 6.87M19 8c0 3.31-2.24 6-5 6.87"/></svg>;
const IcoGlobe = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcoBar  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

const COLORS = ['#818cf8','#38bdf8','#34d399','#f97316','#f59e0b','#a78bfa','#ec4899','#14b8a6'];

/* ── Progress bar ──────────────────────────────────────── */
function ProgressItem({ label, value, max, color = 'var(--accent)' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className={styles.progressItem}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressPct} style={{ color }}>{pct}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Ranked phone row ──────────────────────────────────── */
function RankedPhone({ rank, phone, count, label }) {
  return (
    <div className={styles.rankedItem}>
      <div className={`${styles.rankedNum} ${rank <= 3 ? 'top' : ''}`}>#{rank}</div>
      <BrandLogo brand={phone.brand} size="sm" />
      <div className={styles.rankedInfo}>
        <div className={styles.rankedName}>{phone.phoneName}</div>
        <div className={styles.rankedSub}>{phone.brand} · {label}</div>
      </div>
      <div className={styles.rankedCount}>{count}</div>
    </div>
  );
}

/* ── Skeleton rows ─────────────────────────────────────── */
function SkeletonRanked() {
  return Array.from({ length: 5 }, (_, i) => (
    <div key={i} className={styles.rankedItem}>
      <div className={styles.skelBlock} style={{ width: 28, height: 14, borderRadius: 4 }} />
      <div className={styles.skelBlock} style={{ width: 32, height: 32, borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <div className={styles.skelBlock} style={{ width: '70%', height: 13, borderRadius: 4, marginBottom: 5 }} />
        <div className={styles.skelBlock} style={{ width: '40%', height: 10, borderRadius: 4 }} />
      </div>
      <div className={styles.skelBlock} style={{ width: 28, height: 20, borderRadius: 6 }} />
    </div>
  ));
}

function SkeletonBars({ count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className={styles.progressItem}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <div className={styles.skelBlock} style={{ width: 80, height: 11, borderRadius: 4 }} />
        <div className={styles.skelBlock} style={{ width: 28, height: 11, borderRadius: 4 }} />
      </div>
      <div className={styles.skelBlock} style={{ width: '100%', height: 6, borderRadius: 3 }} />
    </div>
  ));
}

/* ── Dist chart section ────────────────────────────────── */
function DistSection({ title, data, loading }) {
  const max = data?.length ? Math.max(...data.map(d => d.value)) : 0;
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>
        {title}
      </div>
      {loading
        ? <SkeletonBars />
        : !data?.length
          ? <div style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 8 }}>No survey data yet</div>
          : data.map((d, i) => (
              <ProgressItem key={d.label} label={d.label} value={d.value} max={max} color={COLORS[i % COLORS.length]} />
            ))
      }
    </div>
  );
}

export default function Insights() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  const shortlisted = stats?.topShortlisted    ?? [];
  const compared    = stats?.topCompared        ?? [];
  const brandDist   = stats?.brandDistribution  ?? [];
  const survey      = stats?.surveyInsights     ?? null;

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>Insights</div>
        <div className={styles.pageSub}>Platform intelligence and user behavior analytics</div>
      </div>

      {/* ── Most shortlisted + compared ─────────────────── */}
      <div className={styles.grid2} style={{ marginBottom: 16 }}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>
              <span className={styles.panelTitleIcon}><IcoHeart /></span>
              Most Shortlisted
            </div>
          </div>
          <div className={styles.panelBody}>
            {loading
              ? <SkeletonRanked />
              : !shortlisted.length
                ? <div className={styles.emptyState} style={{ padding: '24px 0' }}><p>No shortlist activity yet</p></div>
                : shortlisted.map((p, i) => (
                    <RankedPhone key={p._id} rank={i + 1} phone={p} count={p.count} label="shortlists" />
                  ))
            }
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>
              <span className={styles.panelTitleIcon}><IcoScale /></span>
              Most Compared
            </div>
          </div>
          <div className={styles.panelBody}>
            {loading
              ? <SkeletonRanked />
              : !compared.length
                ? <div className={styles.emptyState} style={{ padding: '24px 0' }}><p>No compare activity yet</p></div>
                : compared.map((p, i) => (
                    <RankedPhone key={p._id} rank={i + 1} phone={p} count={p.count} label="comparisons" />
                  ))
            }
          </div>
        </div>
      </div>

      {/* ── Survey distributions ─────────────────────────── */}
      <div className={styles.panel} style={{ marginBottom: 16 }}>
        <div className={styles.panelHead}>
          <div className={styles.panelTitle}>
            <span className={styles.panelTitleIcon}><IcoBar /></span>
            Survey Distributions
          </div>
          {survey && (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {survey.surveyRate}% completion rate
            </span>
          )}
        </div>
        <div className={styles.panelBody}>
          {!loading && !survey?.usecaseDist?.length && !survey?.brandDist?.length ? (
            <div className={styles.emptyState} style={{ padding: '32px 0' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="40" height="40"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <p>No survey responses yet. Data will appear once users complete the onboarding survey.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
              <DistSection title="Use-Case"         data={survey?.usecaseDist} loading={loading} />
              <DistSection title="Brand Preferences" data={survey?.brandDist}   loading={loading} />
              <DistSection title="Budget Range"      data={survey?.budgetDist}  loading={loading} />
            </div>
          )}
        </div>
      </div>

      {/* ── Popular brands in catalog ────────────────────── */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelTitle}>
            <span className={styles.panelTitleIcon}><IcoGlobe /></span>
            Catalog — Brand Distribution
          </div>
          {!loading && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{brandDist.length} brands</span>}
        </div>
        <div className={styles.panelBody}>
          {loading ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={styles.skelBlock} style={{ width: 140, height: 60, borderRadius: 12, flex: '1 1 130px' }} />
              ))}
            </div>
          ) : !brandDist.length ? (
            <div className={styles.emptyState} style={{ padding: '24px 0' }}><p>No catalog data</p></div>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {brandDist.map((b, i) => (
                <div key={b.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 16px', flex: '1 1 130px',
                }}>
                  <BrandLogo brand={b.label} size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.value} phones</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
