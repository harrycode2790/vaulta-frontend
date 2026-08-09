'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="rgba(111,207,151,0.5)" strokeWidth="1" />
      <path d="M5 8l2 2 4-4" stroke="#6fcf97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

const trustPoints = [
  'FDIC insured up to $250,000',
  '256-bit AES encryption',
  'Trusted by 2M+ savers worldwide',
];
const stats = [
  { value: '2M+',   label: 'Active Savers' },
  { value: '2.2%',  label: 'Avg. MPY' },
  { value: '$4.8B', label: 'Assets Managed' },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const email    = form.email.value.trim();
    const password = form.password.value;

    try {
      await authApi.login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      // Backend returns 403 if email not verified → go verify
      if (err.status === 403 && err.data?.data?.email) {
        router.push(`/verify?email=${encodeURIComponent(err.data.data.email)}`);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Left: brand panel ── */}
      <aside className={styles.brand}>
        <div className={styles.brandInner}>
          <Link href="/" className={styles.brandLogo}>Vaulta</Link>
          <div className={styles.brandBody}>
            <p className={styles.brandEyebrow}>Secure savings platform</p>
            <h2 className={styles.brandHeading}>
              Your future<br />
              <span className={styles.brandAccent}>starts here.</span>
            </h2>
            <p className={styles.brandSubtext}>
              Flexible savings plans designed for every stage of life —
              from solo goals to generational wealth.
            </p>
            <ul className={styles.trustList}>
              {trustPoints.map((point) => (
                <li key={point} className={styles.trustItem}><CheckIcon />{point}</li>
              ))}
            </ul>
          </div>
          <div className={styles.statsRow}>
            {stats.map(({ value, label }) => (
              <div key={label} className={styles.stat}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.blob} ${styles.blobTop}`} aria-hidden="true" />
        <div className={`${styles.blob} ${styles.blobBottom}`} aria-hidden="true" />
      </aside>

      {/* ── Right: form panel ── */}
      <main className={styles.formPanel}>
        <Link href="/" className={styles.mobileLogo}>Vaulta</Link>

        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h1 className={styles.heading}>Welcome back</h1>
            <p className={styles.subtext}>Enter your details to access your vault.</p>
          </div>

          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email" name="email" type="email"
                className={styles.input}
                placeholder="name@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="password">PASSWORD</label>
                <Link href="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <span className={styles.dividerLine} />
          </div>

          <button type="button" className={styles.googleBtn} disabled>
            <GoogleIcon />Continue with Google
          </button>

          <p className={styles.signupRow}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.signupLink}>Create one free</Link>
          </p>
        </div>

        <div className={styles.securityBadge}>
          <span className={styles.shieldIcon}><ShieldIcon /></span>
          256-bit AES encryption protected
        </div>
      </main>
    </div>
  );
}
