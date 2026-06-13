import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import BrandLogo from '../../components/BrandLogo';
import styles from './Admin.module.css';

/* ── Icons ─────────────────────────────────────────────── */
const IcoPhone   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoUsers   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoHeart   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IcoScale   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M5 21h14M5 8l7-5 7 5M5 8c0 3.31 2.24 6 5 6.87M19 8c0 3.31-2.24 6-5 6.87"/></svg>;
const IcoClipboard=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
const IcoArrow   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="10" height="10"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoTrend   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoActivity= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

/* ── Animated counter ──────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

/* ── StatCard ──────────────────────────────────────────── */
function StatCard({ icon, iconBg, iconColor, label, value, sub, subAccent, loading }) {
  const count = useCountUp(typeof value === 'number' ? value : 0);
  if (loading) return (
    <div className={styles.statSkeleton}>
      <div className={styles.skelBlock} style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 12 }} />
      <div className={styles.skelBlock} style={{ width: 80, height: 10, marginBottom: 8 }} />
      <div className={styles.skelBlock} style={{ width: 60, height: 28 }} />
    </div>
  );
  return (
    <div className={`${styles.statCard} ${iconColor === 'var(--accent)' ? styles.statCardAccent : ''}`}>
      <div className={styles.statIcon} style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={{ color: iconColor === 'var(--accent)' ? 'var(--accent)' : 'var(--text)' }}>
        {typeof value === 'number' ? count.toLocaleString() : (value ?? '–')}
      </div>
      {sub && <div className={`${styles.statSub} ${subAccent ? styles.statSubAccent : ''}`}>{sub}</div>}
    </div>
  );
}

/* ── Donut Chart (pure SVG, no lib) ────────────────────── */
const DONUT_COLORS = ['#818cf8','#38bdf8','#34d399','#f97316','#f59e0b','#a78bfa'];
function DonutChart({ data, size = 120, thickness = 22 }) {
  const r = (size / 2) - thickness;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <div className={styles.donutWrap}>
      <svg width={size} height={size} className={styles.donutSvg}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circ;
          const seg = (
            <circle key={d.label}
              cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size/2} ${size/2})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
        <text x={size/2} y={size/2 + 5} textAnchor="middle" fill="var(--text)" fontSize="16" fontWeight="800" fontFamily="Inter,sans-serif">
          {total.toLocaleString()}
        </text>
      </svg>
      <div className={styles.donutLegend}>
        {data.map((d, i) => (
          <div key={d.label} className={styles.donutItem}>
            <div className={styles.donutDot} style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span>{d.label}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: 8, fontWeight: 700, color: 'var(--text)' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar row ────────────────────────────────────────────── */
function BarRow({ label, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className={styles.barRow}>
      <div className={styles.barLabel}>{label}</div>
      <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${pct}%` }} /></div>
      <div className={styles.barCount}>{value}</div>
    </div>
  );
}

/* ── Mock activity data ─────────────────────────────────── */
const MOCK_ACTIVITY = [
  { color: '#818cf8', text: <>User shortlisted <strong>Samsung Galaxy S25 Ultra</strong></>, time: '2m ago' },
  { color: '#34d399', text: <>New signup: <strong>ali_hassan@gmail.com</strong></>, time: '8m ago' },
  { color: '#f97316', text: <>User compared <strong>Pixel 9 Pro</strong> vs <strong>iPhone 16 Pro</strong></>, time: '15m ago' },
  { color: '#818cf8', text: <>Survey completed by <strong>sara.malik@outlook.com</strong></>, time: '31m ago' },
  { color: '#38bdf8', text: <>Admin updated visibility: <strong>OnePlus 13</strong></>, time: '1h ago' },
  { color: '#f59e0b', text: <>User shortlisted <strong>Xiaomi 15 Pro</strong></>, time: '2h ago' },
];

/* ── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  // Brand distribution from phones (mock if not available)
  const brandDist = stats?.brandDistribution || [
    { label: 'Samsung', value: 52 },
    { label: 'Apple',   value: 38 },
    { label: 'Xiaomi',  value: 29 },
    { label: 'Google',  value: 18 },
    { label: 'OnePlus', value: 14 },
    { label: 'Motorola',value: 10 },
  ];
  const maxBrand = Math.max(...brandDist.map(b => b.value));

  const usecaseDist = stats?.usecaseDistribution || [
    { label: 'Gaming',      value: 34 },
    { label: 'Camera',      value: 28 },
    { label: 'Daily Use',   value: 22 },
    { label: 'Battery',     value: 18 },
    { label: 'Business',    value: 11 },
    { label: 'Value',       value: 9  },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>Dashboard</div>
        <div className={styles.pageSub}>Platform analytics at a glance</div>
      </div>

      {/* ── Stat row ───────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <StatCard loading={loading} icon={<IcoPhone />}    iconBg="rgba(129,140,248,0.15)" iconColor="var(--accent)" label="Total Phones"   value={stats?.totalPhones} sub="in catalog" />
        <StatCard loading={loading} icon={<IcoUsers />}    iconBg="rgba(56,189,248,0.12)"  iconColor="#38bdf8"       label="Total Users"    value={stats?.totalUsers}  sub={`${stats?.activeUsers ?? 0} active`} subAccent />
        <StatCard loading={loading} icon={<IcoHeart />}    iconBg="rgba(249,115,22,0.12)"  iconColor="#f97316"       label="Shortlist Saves" value={stats?.wishlistTotal} />
        <StatCard loading={loading} icon={<IcoScale />}    iconBg="rgba(52,211,153,0.12)"  iconColor="#34d399"       label="Comparisons"    value={stats?.compareTotal ?? 0} />
        <StatCard loading={loading} icon={<IcoClipboard />}iconBg="rgba(245,158,11,0.12)" iconColor="#f59e0b"       label="Survey Completions" value={stats?.surveyCompletions ?? 0} />
      </div>

      {/* ── Row 1: Top phones + recent signups ─────────── */}
      <div className={styles.grid2}>
        {/* Most wishlisted / compared */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>
              <span className={styles.panelTitleIcon}><IcoTrend /></span>
              Trending Phones
            </div>
            <Link to="/admin/phones" className={styles.panelLink}>All phones <IcoArrow /></Link>
          </div>
          <div className={styles.panelBody}>
            {loading ? (
              [0,1,2].map(i => <div key={i} className={styles.skelBlock} style={{ height: 48, borderRadius: 10, marginBottom: 10 }} />)
            ) : (
              <>
                {stats?.mostWishlisted && (
                  <div className={styles.rankedItem}>
                    <div className={`${styles.rankedNum} top`}>1</div>
                    <BrandLogo brand={stats.mostWishlisted.brand} size="sm" />
                    <div className={styles.rankedInfo}>
                      <div className={styles.rankedName}>{stats.mostWishlisted.phoneName}</div>
                      <div className={styles.rankedSub}>Most shortlisted</div>
                    </div>
                    <div className={styles.rankedCount}>{stats.mostWishlisted.wishlistCount}</div>
                  </div>
                )}
                {stats?.mostCompared && (
                  <div className={styles.rankedItem}>
                    <div className={`${styles.rankedNum} top`}>2</div>
                    <BrandLogo brand={stats.mostCompared.brand} size="sm" />
                    <div className={styles.rankedInfo}>
                      <div className={styles.rankedName}>{stats.mostCompared.phoneName}</div>
                      <div className={styles.rankedSub}>Most compared</div>
                    </div>
                    <div className={styles.rankedCount}>{stats.mostCompared.compareCount}</div>
                  </div>
                )}
                {(!stats?.mostWishlisted && !stats?.mostCompared) && (
                  <div className={styles.emptyState} style={{ padding: '24px 0' }}>
                    <p>No usage data yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent signups */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>
              <span className={styles.panelTitleIcon}><IcoUsers /></span>
              Recent Signups
            </div>
            <Link to="/admin/users" className={styles.panelLink}>All users <IcoArrow /></Link>
          </div>
          <div className={styles.panelBody}>
            {loading ? (
              [0,1,2,3].map(i => <div key={i} className={styles.skelBlock} style={{ height: 40, borderRadius: 10, marginBottom: 8 }} />)
            ) : stats?.recentSignups?.length ? (
              stats.recentSignups.map(u => (
                <div key={u._id} className={styles.rankedItem}>
                  <div className={styles.userAvatar}>{u.name[0].toUpperCase()}</div>
                  <div className={styles.rankedInfo}>
                    <div className={styles.rankedName}>{u.name}</div>
                    <div className={styles.rankedSub}>{u.email}</div>
                  </div>
                  <span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>{u.role}</span>
                </div>
              ))
            ) : <div className={styles.emptyState} style={{ padding: '24px 0' }}><p>No users yet</p></div>}
          </div>
        </div>
      </div>

      {/* ── Row 2: Brand distribution + Use case + Activity ── */}
      <div className={styles.grid3} style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {/* Brand dist */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Popular Brands</div>
          </div>
          <div className={styles.panelBody}>
            {brandDist.map(b => <BarRow key={b.label} label={b.label} value={b.value} max={maxBrand} />)}
          </div>
        </div>

        {/* Use-case donut */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>
              <span className={styles.panelTitleIcon}><IcoActivity /></span>
              Use-Case Distribution
            </div>
          </div>
          <div className={styles.panelBody}>
            <DonutChart data={usecaseDist} size={130} thickness={18} />
          </div>
        </div>

        {/* Activity feed */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Recent Activity</div>
          </div>
          <div className={styles.panelBody} style={{ padding: '12px 20px' }}>
            <div className={styles.activityList}>
              {MOCK_ACTIVITY.map((a, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityDot} style={{ background: a.color }} />
                  <div style={{ flex: 1 }}>
                    <div className={styles.activityText}>{a.text}</div>
                    <div className={styles.activityTime}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
