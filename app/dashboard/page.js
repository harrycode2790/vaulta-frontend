'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

/* ══════════════════════════════
   SVG Icons
   ══════════════════════════════ */
const Icon = {
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Wallet: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  TrendUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Plus: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ArrowDown: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  CheckCircle: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>,
  ArrowRight: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Refresh: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

/* ══════════════════════════════
   Helpers
   ══════════════════════════════ */
function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function planFeatures(planName) {
  if (planName === 'Family Plan') return ['Up to 6 members', 'Shared savings goals', 'Priority chat support', 'Advanced analytics'];
  if (planName === 'Duo Plan')    return ['Joint savings goals', 'Automated split transfers', 'Priority chat support', 'Advanced analytics'];
  return ['Flexible deposits', 'Auto compound interest', '24/7 access', 'Secure withdrawals'];
}

function planDesc(planName) {
  if (planName === 'Family Plan') return 'Maximum yield for families saving together toward shared goals.';
  if (planName === 'Duo Plan')    return 'Optimized for high-yield seekers with strategic shared assets.';
  return 'Simple, secure savings with consistent returns for individuals.';
}

function upgradeTarget(planName) {
  if (planName === 'Family Plan') return null;
  if (planName === 'Duo Plan')    return { label: 'Upgrade to Family · 30% MPY', href: '/dashboard/vaults' };
  return { label: 'Upgrade to Duo · 15% MPY', href: '/dashboard/vaults' };
}

/* ══════════════════════════════
   Balance sparkline chart (dynamic)
   ══════════════════════════════ */
function BalanceChart({ totalBalance }) {
  const w = 500; const h = 110; const pad = 10;
  // Generate a smooth ascending curve ending at totalBalance
  const base   = totalBalance * 0.38;
  const points = 8;
  const raw = Array.from({ length: points }, (_, i) =>
    base + (totalBalance - base) * (i / (points - 1)) * (0.7 + 0.3 * Math.random())
  );
  raw[raw.length - 1] = totalBalance;

  const min = Math.min(...raw) * 0.95;
  const max = Math.max(...raw) * 1.02;
  const pts = raw.map((v, i) => {
    const x = (i / (raw.length - 1)) * (w - pad * 2) + pad;
    const y = h - ((v - min) / (max - min || 1)) * (h - pad * 2) - pad;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePts = pts.join(' ');
  const areaPts = `${pad},${h} ${linePts} ${w - pad},${h}`;
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.chartSvg} aria-hidden="true">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0D2B1F" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0D2B1F" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPts} fill="url(#areaGrad)" />
        <polyline points={linePts} fill="none" stroke="#0D2B1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="4" fill="#0D2B1F" />
      </svg>
      <div className={styles.chartLabels}>
        {months.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Skeleton loader
   ══════════════════════════════ */
function Skeleton({ className }) {
  return <div className={`${styles.skeleton} ${className || ''}`} aria-hidden="true" />;
}

/* ══════════════════════════════
   Quick Actions (static)
   ══════════════════════════════ */
const quickActions = [
  { label: 'Deposit',  Icon: Icon.Plus,      href: '/dashboard/deposit' },
  { label: 'Withdraw', Icon: Icon.ArrowDown, href: '/dashboard/withdraw' },
  { label: 'Transfer', Icon: Icon.Send,       href: '/dashboard/transfer' },
  { label: 'Invite',   Icon: Icon.Users,      href: '/dashboard/invite' },
];

/* ══════════════════════════════
   Page
   ══════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    authApi.getDashboardSummary()
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.status === 401) { router.replace('/login'); return; }
        setError(err.message || 'Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const user       = data?.user;
  const summary    = data?.summary;
  const activity   = data?.recentActivity ?? [];

  const planName   = summary?.currentPlan   ?? '—';
  const planRate   = summary?.currentRate   ?? 0;
  const totalBal   = summary?.totalBalance  ?? 0;
  const totalYield = summary?.totalYield    ?? 0;
  const upgrade    = planName !== '—' ? upgradeTarget(planName) : null;

  const stats = [
    {
      label: 'Total Balance',
      value: loading ? null : fmt(totalBal),
      change: loading ? null : (totalBal > 0 ? 'Across all active plans' : 'No active plans yet'),
      positive: totalBal > 0,
      Icon: Icon.Wallet,
      color: 'green',
    },
    {
      label: 'Total Yield',
      value: loading ? null : fmt(totalYield),
      change: loading ? null : 'All time interest earned',
      positive: totalYield > 0,
      Icon: Icon.TrendUp,
      color: 'teal',
    },
    {
      label: 'Current Plan',
      value: loading ? null : (planName !== '—' ? planName : 'No plan yet'),
      change: loading ? null : (planRate > 0 ? `${planRate}% MPY` : 'Start saving to begin'),
      positive: planRate > 0,
      Icon: Icon.Shield,
      color: 'blue',
    },
    {
      label: 'Active Plans',
      value: loading ? null : String(
        (summary?.activeSingleCount ?? 0) +
        (summary?.activeDuoCount    ?? 0) +
        (summary?.activeFamilyCount ?? 0)
      ),
      change: loading ? null : [
        summary?.activeSingleCount ? `${summary.activeSingleCount} Solo` : null,
        summary?.activeDuoCount    ? `${summary.activeDuoCount} Duo`    : null,
        summary?.activeFamilyCount ? `${summary.activeFamilyCount} Family` : null,
      ].filter(Boolean).join(' · ') || 'No active plans',
      positive: false,
      Icon: Icon.Zap,
      color: 'amber',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {error && (
          <div className={styles.errorBanner} role="alert">{error}</div>
        )}

        {/* ── Stat cards ── */}
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={`${styles.statCard} ${styles[`stat_${s.color}`]}`}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={`${styles.statIconWrap} ${styles[`icon_${s.color}`]}`}>
                  <s.Icon />
                </span>
              </div>
              {s.value == null
                ? <Skeleton className={styles.skeletonVal} />
                : <div className={styles.statValue}>{s.value}</div>
              }
              {s.change == null
                ? <Skeleton className={styles.skeletonChange} />
                : (
                  <div className={`${styles.statChange} ${s.positive ? styles.statChangePos : ''}`}>
                    {s.positive && <Icon.TrendUp />}
                    {s.change}
                  </div>
                )
              }
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className={styles.mainGrid}>

          {/* Balance chart card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Portfolio Balance</h2>
                <p className={styles.cardSub}>Growth overview</p>
              </div>
              <div className={styles.periodTabs}>
                {['1M', '3M', '6M', '1Y'].map((p) => (
                  <button key={p} className={`${styles.periodTab} ${p === '6M' ? styles.periodTabActive : ''}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.chartBanner}>
              <div>
                {loading
                  ? <Skeleton className={styles.skeletonBig} />
                  : <span className={styles.chartBalance}>{fmt(totalBal)}</span>
                }
                {!loading && totalYield > 0 && (
                  <span className={styles.chartGain}>
                    ↑ +{fmt(totalYield)} yield earned
                  </span>
                )}
              </div>
              {!loading && <span className={styles.chartPeriod}>since account creation</span>}
            </div>

            {loading
              ? <Skeleton className={styles.skeletonChart} />
              : <BalanceChart totalBalance={totalBal || 1000} />
            }
          </div>

          {/* Plan card */}
          <div className={`${styles.card} ${styles.planCard}`}>
            {loading ? (
              <>
                <Skeleton className={styles.skeletonBadge} />
                <Skeleton className={styles.skeletonBig} />
                <Skeleton className={styles.skeletonLine} />
              </>
            ) : planName !== '—' ? (
              <>
                <div className={styles.planBadge}>ACTIVE PLAN</div>
                <div className={styles.planRateRow}>
                  <span className={styles.planRate}>{planRate}%</span>
                  <span className={styles.planRateSuffix}>MPY</span>
                </div>
                <h3 className={styles.planName}>{planName}</h3>
                <p className={styles.planDesc}>{planDesc(planName)}</p>
                <ul className={styles.planFeatures}>
                  {planFeatures(planName).map((f) => (
                    <li key={f} className={styles.planFeatureItem}>
                      <span className={styles.planCheck}><Icon.CheckCircle /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                {upgrade && (
                  <>
                    <div className={styles.planDivider} />
                    <p className={styles.upgradeLabel}>Ready for more?</p>
                    <Link href={upgrade.href} className={styles.upgradeBtn}>
                      {upgrade.label}
                      <Icon.ArrowRight />
                    </Link>
                  </>
                )}
              </>
            ) : (
              <div className={styles.noPlan}>
                <div className={styles.planBadge} style={{ background: '#e8eaed', color: '#5f6368' }}>NO PLAN</div>
                <h3 className={styles.planName} style={{ marginTop: '16px' }}>Start Saving</h3>
                <p className={styles.planDesc}>Create your first vault to begin earning compound interest.</p>
                <div className={styles.planDivider} />
                <Link href="/dashboard/vaults" className={styles.upgradeBtn}>
                  Explore Plans <Icon.ArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom grid ── */}
        <div className={styles.bottomGrid}>

          {/* Recent Activity */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recent Activity</h2>
                <p className={styles.cardSub}>Your latest transactions</p>
              </div>
              <Link href="/dashboard/transactions" className={styles.viewAllLink}>
                View all <Icon.ArrowRight />
              </Link>
            </div>

            <div className={styles.txList}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.txRow}>
                    <Skeleton className={styles.skeletonDot} />
                    <div className={styles.txInfo}>
                      <Skeleton className={styles.skeletonLine} />
                      <Skeleton className={styles.skeletonShort} />
                    </div>
                    <Skeleton className={styles.skeletonShort} />
                  </div>
                ))
              ) : activity.length === 0 ? (
                <div className={styles.emptyState}>
                  No transactions yet. Make your first deposit to get started.
                </div>
              ) : (
                activity.map((tx, i) => (
                  <div key={i} className={styles.txRow}>
                    <div className={`${styles.txDot} ${styles[`dot_${tx.type}`]}`} aria-hidden="true" />
                    <div className={styles.txInfo}>
                      <span className={styles.txName}>{tx.name}</span>
                      <span className={styles.txMeta}>
                        <span className={`${styles.txTag} ${styles[`tag_${tx.type}`]}`}>{tx.category}</span>
                        {fmtDate(tx.date)}
                      </span>
                    </div>
                    <span className={styles.txAmount}>+{fmt(tx.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions + Yield snapshot */}
          <div className={styles.rightCol}>

            {/* Quick actions */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: '18px' }}>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                {quickActions.map(({ label, Icon: Ic, href }) => (
                  <Link key={label} href={href} className={styles.actionBtn}>
                    <span className={styles.actionIcon}><Ic /></span>
                    <span className={styles.actionLabel}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Yield snapshot */}
            <div className={`${styles.card} ${styles.yieldCard}`}>
              <div className={styles.yieldTop}>
                <span className={styles.yieldIcon}><Icon.Refresh /></span>
                <span className={styles.yieldLive}>Live</span>
              </div>
              {loading
                ? <Skeleton className={styles.skeletonBig} />
                : <div className={styles.yieldValue}>{fmt(totalYield)}</div>
              }
              <div className={styles.yieldLabel}>Total yield earned</div>
              <div className={styles.yieldBar}>
                <div
                  className={styles.yieldFill}
                  style={{ width: totalBal > 0 ? `${Math.min((totalYield / totalBal) * 100 * 5, 100).toFixed(0)}%` : '0%' }}
                />
              </div>
              <div className={styles.yieldMeta}>
                <span>$0</span>
                <span>{planRate > 0 ? `${planRate}% MPY` : 'No active plan'}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
