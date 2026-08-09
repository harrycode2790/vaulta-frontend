'use client';
import { useState } from 'react';
import styles from './page.module.css';

/* ══════════════════════════════
   Icons
   ══════════════════════════════ */
function ShieldIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function FingerprintIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-1.7.7-3.3 1.8-4.5"/><path d="M17.5 5c1 1.3 1.5 2.9 1.5 4.5"/><path d="M22 12c0 1.5-.5 3-1.5 4.2"/><path d="M17.5 19a10 10 0 0 1-5.5 3c-1.2 0-2.4-.2-3.5-.7"/><path d="M9 16.5C9 14 10.3 12 12 12s3 2 3 4.5-1 4.5-3 4.5"/><path d="M12 8a4 4 0 0 1 4 4c0 1.5-.4 2.9-1.1 4"/></svg>;
}
function KeyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
}
function MonitorIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function PhoneIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function MessageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>;
}
function AlertCircleIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function XIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function DownloadIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function RefreshIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
}

/* ══════════════════════════════
   Security Health Ring
   ══════════════════════════════ */
function SecurityHealthCard({ score = 92 }) {
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;

  return (
    <div className={styles.healthCard}>
      <div className={styles.healthRingWrap}>
        <svg width="96" height="96" viewBox="0 0 96 96" aria-label={`Security score ${score}`}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e0ece5" strokeWidth="7" />
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke="#0D2B1F"
            strokeWidth="7"
            strokeDasharray={`${fill.toFixed(1)} ${circ.toFixed(1)}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
          <text x="48" y="54" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0D2B1F" fontFamily="inherit">{score}</text>
        </svg>
      </div>
      <div className={styles.healthInfo}>
        <span className={styles.healthLabel}>SECURITY HEALTH</span>
        <span className={styles.healthRating}>Excellent</span>
        <span className={styles.healthTag}>
          <CheckCircleIcon /> High-Grade Protection
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Toggle switch
   ══════════════════════════════ */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}

/* ══════════════════════════════
   Page
   ══════════════════════════════ */
const initialSessions = [
  { id: 1, device: 'MacOS', browser: 'Chrome',  location: 'San Francisco, USA', detail: '192.168.1.1', icon: 'monitor', current: true },
  { id: 2, device: 'iPhone 15 Pro', browser: 'Vaulta App', location: 'London, UK',          detail: '2 hours ago',  icon: 'phone',   current: false },
  { id: 3, device: 'Windows 11',    browser: 'Firefox',    location: 'New York, USA',        detail: 'Yesterday',    icon: 'monitor', current: false },
];

const recommendations = [
  { type: 'ok',   text: 'Your password was updated 12 days ago. Perfect.' },
  { type: 'warn', text: 'Update your Recovery Email to ensure access during lockouts.' },
  { type: 'ok',   text: 'Login alerts are active for all new devices.' },
];

export default function SettingsPage() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);
  const [tfaMethod,    setTfaMethod]    = useState('app');
  const [sessions,     setSessions]     = useState(initialSessions);

  const revokeSession = (id) =>
    setSessions((s) => s.filter((x) => x.id !== id));

  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {/* ── Header row ── */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Security Settings</h1>
            <p className={styles.pageSub}>
              Configure your bank-grade encryption layers and manage session access
              to keep your digital assets crystalline and secure.
            </p>
          </div>
          <SecurityHealthCard score={92} />
        </div>

        {/* ── Main two-column grid ── */}
        <div className={styles.mainGrid}>

          {/* ── Left column ── */}
          <div className={styles.leftCol}>

            {/* Two-Factor Authentication */}
            <div className={styles.card}>
              <div className={styles.sectionLabel}>AUTH</div>

              <div className={styles.twoFaHeader}>
                <div className={styles.twoFaLeft}>
                  <div className={styles.twoFaIconWrap}>
                    <ShieldIcon size={20} />
                  </div>
                  <div>
                    <div className={styles.twoFaTitle}>Two-Factor Authentication</div>
                    <div className={styles.twoFaSub}>Secure your account with a secondary verification layer.</div>
                  </div>
                </div>
                <Toggle
                  checked={twoFaEnabled}
                  onChange={setTwoFaEnabled}
                  label="Toggle two-factor authentication"
                />
              </div>

              {twoFaEnabled && (
                <div className={styles.methodGrid}>
                  {/* Authenticator App */}
                  <button
                    className={`${styles.methodCard} ${tfaMethod === 'app' ? styles.methodActive : ''}`}
                    onClick={() => setTfaMethod('app')}
                    aria-pressed={tfaMethod === 'app'}
                  >
                    <div className={styles.methodIcon}><PhoneIcon /></div>
                    <div className={styles.methodText}>
                      <span className={styles.methodName}>Authenticator App</span>
                      <span className={styles.methodDesc}>Recommended</span>
                    </div>
                    <span className={`${styles.methodCheck} ${tfaMethod === 'app' ? styles.methodCheckOn : ''}`}>
                      <CheckCircleIcon />
                    </span>
                  </button>

                  {/* SMS Verification */}
                  <button
                    className={`${styles.methodCard} ${tfaMethod === 'sms' ? styles.methodActive : ''}`}
                    onClick={() => setTfaMethod('sms')}
                    aria-pressed={tfaMethod === 'sms'}
                  >
                    <div className={styles.methodIcon}><MessageIcon /></div>
                    <div className={styles.methodText}>
                      <span className={styles.methodName}>SMS Verification</span>
                      <span className={styles.methodDesc}>Backup Method</span>
                    </div>
                    <span className={`${styles.methodCheck} ${tfaMethod === 'sms' ? styles.methodCheckOn : ''}`}>
                      <CheckCircleIcon />
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Biometric Access */}
            <div className={styles.card}>
              <div className={styles.bioRow}>
                <div className={styles.bioLeft}>
                  <div className={styles.bioIconWrap}>
                    <FingerprintIcon />
                  </div>
                  <div>
                    <div className={styles.bioTitle}>Biometric Access</div>
                    <div className={styles.bioSub}>Unlock your vault using FaceID or TouchID.</div>
                  </div>
                </div>
                <button className={styles.configureBtn}>Configure</button>
              </div>
            </div>

            {/* Quantum Encryption Keys */}
            <div className={`${styles.card} ${styles.encryptionCard}`}>
              {/* Decorative shield BG */}
              <div className={styles.shieldBg} aria-hidden="true">
                <svg viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M90 8L16 38v60c0 50 37 88 74 95 37-7 74-45 74-95V38L90 8z"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="rgba(255,255,255,0.03)" />
                  <path d="M90 30L32 55v50c0 40 30 70 58 76 28-6 58-36 58-76V55L90 30z"
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="rgba(255,255,255,0.02)" />
                  <circle cx="90" cy="105" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="rgba(255,255,255,0.03)" />
                  <path d="M90 90v15l8 8" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="80" y="102" width="20" height="14" rx="2" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
                </svg>
              </div>

              <div className={styles.encContent}>
                <div className={styles.encHeader}>
                  <div className={styles.encIconWrap}><KeyIcon /></div>
                  <span className={styles.encTitle}>Quantum Encryption Keys</span>
                </div>
                <p className={styles.encDesc}>
                  Your assets are protected by AES-256-GCM hardware-backed encryption.
                  Manage your recovery seed and master public keys.
                </p>
                <div className={styles.encActions}>
                  <button className={styles.rotateBtn}>
                    <RefreshIcon /> Rotate Keys
                  </button>
                  <button className={styles.downloadBtn}>
                    <DownloadIcon /> Download Recovery Kit
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right column ── */}
          <div className={styles.rightCol}>

            {/* Active Sessions */}
            <div className={styles.card}>
              <div className={styles.sessionsHeader}>
                <h2 className={styles.sessionsTitle}>Active Sessions</h2>
                <button
                  className={styles.logoutAllBtn}
                  onClick={() => setSessions((s) => s.filter((x) => x.current))}
                >
                  Log out all
                </button>
              </div>

              <div className={styles.sessionList}>
                {sessions.map((s) => (
                  <div key={s.id} className={`${styles.sessionRow} ${s.current ? styles.sessionCurrent : ''}`}>
                    <div className={styles.sessionIcon}>
                      {s.icon === 'monitor' ? <MonitorIcon /> : <PhoneIcon />}
                    </div>
                    <div className={styles.sessionInfo}>
                      <span className={styles.sessionDevice}>{s.device} &bull; {s.browser}</span>
                      <span className={styles.sessionMeta}>{s.location} &bull; {s.detail}</span>
                    </div>
                    {s.current ? (
                      <span className={styles.currentBadge}>CURRENT</span>
                    ) : (
                      <button
                        className={styles.revokeBtn}
                        onClick={() => revokeSession(s.id)}
                        aria-label={`Revoke session on ${s.device}`}
                      >
                        <XIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security Recommendations */}
            <div className={styles.recsCard}>
              <div className={styles.recsHeader}>
                <span className={styles.recsIcon}><ShieldIcon size={18} /></span>
                <h2 className={styles.recsTitle}>Security Recommendations</h2>
              </div>
              <div className={styles.recsList}>
                {recommendations.map((r, i) => (
                  <div key={i} className={`${styles.recRow} ${styles[`rec_${r.type}`]}`}>
                    <span className={styles.recIcon}>
                      {r.type === 'ok' ? <CheckCircleIcon /> : <AlertCircleIcon />}
                    </span>
                    <span className={styles.recText}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Zero-Knowledge banner ── */}
        <div className={styles.zkBanner}>
          {/* Decorative crystal geometry */}
          <div className={styles.zkDeco} aria-hidden="true">
            <svg viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
              <polygon points="320,20 420,80 400,180 300,200 220,140 260,40" stroke="rgba(111,207,151,0.12)" strokeWidth="1.5" fill="rgba(111,207,151,0.04)" />
              <polygon points="380,10 520,60 500,160 380,190 280,130 300,30" stroke="rgba(111,207,151,0.08)" strokeWidth="1" fill="rgba(111,207,151,0.02)" />
              <polygon points="440,40 560,90 540,180 420,200 340,140 360,60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
              <polygon points="480,0  600,50 580,150 460,180 370,110 400,20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
              <line x1="320" y1="20"  x2="420" y2="80"  stroke="rgba(111,207,151,0.1)" strokeWidth="1" />
              <line x1="420" y1="80"  x2="400" y2="180" stroke="rgba(111,207,151,0.1)" strokeWidth="1" />
              <line x1="400" y1="180" x2="300" y2="200" stroke="rgba(111,207,151,0.07)" strokeWidth="1" />
              <line x1="300" y1="200" x2="220" y2="140" stroke="rgba(111,207,151,0.07)" strokeWidth="1" />
              <line x1="340" y1="50"  x2="500" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="380" y1="10"  x2="300" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="420" cy="80"  r="4" fill="rgba(111,207,151,0.2)" />
              <circle cx="400" cy="180" r="3" fill="rgba(111,207,151,0.15)" />
              <circle cx="520" cy="60"  r="3" fill="rgba(111,207,151,0.1)" />
            </svg>
          </div>

          <div className={styles.zkContent}>
            <div className={styles.zkIconWrap}>
              <ShieldIcon size={24} />
            </div>
            <div>
              <h2 className={styles.zkTitle}>Zero-Knowledge Architecture</h2>
              <p className={styles.zkDesc}>
                Vaulta never sees your private keys. Only you hold the power to unlock your financial future.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
