import Link from 'next/link';
import styles from './page.module.css';

/* ══════════════════════════════
   Icons
   ══════════════════════════════ */
function PlusIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function UmbrellaIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>;
}
function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function FamilyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function CardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
}
function ZapIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function ArrowRightIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function TrendIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}

/* ══════════════════════════════
   Mini bar chart (SVG)
   ══════════════════════════════ */
function MiniBarChart({ data, accentColor = '#0D2B1F' }) {
  const max  = Math.max(...data);
  const bw   = 14;
  const gap  = 5;
  const h    = 52;
  const total = data.length * (bw + gap) - gap;

  return (
    <svg viewBox={`0 0 ${total} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden="true">
      {data.map((v, i) => {
        const barH = Math.max(5, (v / max) * (h - 4));
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={h - barH}
            width={bw}
            height={barH}
            rx="3"
            fill={i === data.length - 1 ? accentColor : '#e8ece9'}
          />
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════
   Data
   ══════════════════════════════ */
const vaults = [
  {
    id:       'rainy-day',
    name:     'Solo Vault',
    plan:     'Solo',
    planKey:  'solo',
    mpy:      10,
    href:     '/dashboard/vaults/single',
    Icon:     UmbrellaIcon,
    data:     [3, 3, 4, 5, 5, 6, 7, 10],
    months:   ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
    featured: false,
  },
  {
    id:       'down-payment',
    name:     'Duo Vault',
    plan:     'Duo',
    planKey:  'duo',
    mpy:      15,
    href:     '/dashboard/vaults/duo',
    Icon:     HomeIcon,
    data:     [2, 4, 5, 5, 6, 7, 8, 10],
    months:   ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
    featured: true,
  },
  {
    id:       'family-legacy',
    name:     'Family Vault',
    plan:     'Family',
    planKey:  'family',
    mpy:      30,
    href:     '/dashboard/vaults/family',
    Icon:     FamilyIcon,
    data:     [2, 3, 5, 6, 7, 7, 9, 10],
    months:   ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
    featured: false,
  },
];

/* ══════════════════════════════
   Page
   ══════════════════════════════ */
export default function MyVaultsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>My Vaults</h1>
            <p className={styles.pageSub}>Manage and monitor your active savings goals across different strategies.</p>
          </div>
          <button className={styles.createBtn}>
            <PlusIcon />
            Create New Vault
          </button>
        </div>

        {/* ── Vault cards ── */}
        <div className={styles.vaultGrid}>
          {vaults.map((v) => (
            <article key={v.id} className={`${styles.vaultCard} ${v.featured ? styles.vaultFeatured : ''}`}>

              {v.featured && (
                <div className={styles.popularBadge} aria-label="Most popular vault">Most Popular</div>
              )}

              {/* Card top: icon + plan */}
              <div className={styles.cardTop}>
                <div className={`${styles.iconWrap} ${styles[`icon_${v.planKey}`]}`}>
                  <v.Icon />
                </div>
                <span className={`${styles.planTag} ${styles[`plan_${v.planKey}`]}`}>
                  {v.plan} Plan
                </span>
              </div>

              {/* Name + rate */}
              <h2 className={styles.vaultName}>{v.name}</h2>
              <div className={styles.rateRow}>
                <span className={`${styles.rateNum} ${styles[`rate_${v.planKey}`]}`}>{v.mpy}%</span>
                <span className={styles.rateSuffix}>MPY</span>
              </div>

              {/* Divider */}
              <div className={styles.divider} />

              {/* Rate info */}
              <div className={styles.balanceRow}>
                <div>
                  <div className={styles.balanceLabel}>Annual Rate</div>
                  <div className={styles.balanceValue}>{v.mpy}% MPY</div>
                </div>
                <div className={styles.changeCol}>
                  <span className={styles.changePct}>
                    <TrendIcon />Compound
                  </span>
                  <span className={styles.changeLabel}>Interest</span>
                </div>
              </div>

              {/* Open Vault CTA */}
              <Link href={v.href} className={`${styles.withdrawBtn} ${v.featured ? styles.withdrawFeatured : ''}`}>
                <CardIcon />
                Open Vault
              </Link>

              {/* Mini chart */}
              <div className={styles.chartArea}>
                <MiniBarChart data={v.data} accentColor={v.featured ? '#0D2B1F' : '#1a4a30'} />
                <div className={styles.chartMonths}>
                  {v.months.slice(-4).map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>

            </article>
          ))}
        </div>

        {/* ── Bottom section ── */}
        <div className={styles.bottomGrid}>

          {/* Yield optimization */}
          <div className={styles.yieldCard}>
            <div className={styles.yieldLeft}>
              <h3 className={styles.yieldTitle}>Yield Optimization</h3>
              <p className={styles.yieldDesc}>
                Your combined portfolio is outperforming 92% of users. Switch
                &lsquo;Personal Rainy Day&rsquo; to a Duo Plan to unlock an additional
                5% MPY.
              </p>
              <a href="#" className={styles.yieldLink}>
                View Optimization Report <ArrowRightIcon />
              </a>
            </div>
            <div className={styles.yieldRight}>
              {/* Inline bars */}
              <div className={styles.yieldBars}>
                {[55, 72, 90].map((pct, i) => (
                  <div key={i} className={styles.yieldBarWrap}>
                    <div className={styles.yieldBar} style={{ height: `${pct}%` }} />
                  </div>
                ))}
              </div>
              <div className={styles.yieldStat}>
                <span className={styles.yieldPct}>14.2%</span>
                <span className={styles.yieldStatSub}>Combined avg. MPY</span>
              </div>
            </div>
          </div>

          {/* Instant transfer */}
          <div className={styles.transferCard}>
            <div className={styles.transferIconWrap}>
              <ZapIcon />
            </div>
            <div className={styles.transferBody}>
              <h3 className={styles.transferTitle}>Instant Transfer</h3>
              <p className={styles.transferDesc}>
                Move funds between your vaults instantly with zero fees.
              </p>
            </div>
            <button className={styles.transferBtn}>Start Transfer</button>
          </div>

        </div>
      </div>
    </div>
  );
}
