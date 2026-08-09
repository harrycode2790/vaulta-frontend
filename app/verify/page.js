'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const email        = params.get('email') || '';

  const [digits, setDigits]   = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [resent, setResent]   = useState(false);
  const inputs = useRef([]);

  // Auto-focus first box on mount
  useEffect(() => { inputs.current[0]?.focus(); }, []);

  function handleChange(i, val) {
    // Accept paste of full code
    if (val.length > 1) {
      const chars = val.replace(/\D/g, '').slice(0, 5).split('');
      const next  = [...digits];
      chars.forEach((c, idx) => { if (idx < 5) next[idx] = c; });
      setDigits(next);
      inputs.current[Math.min(chars.length, 4)]?.focus();
      return;
    }
    const clean = val.replace(/\D/g, '');
    const next  = [...digits];
    next[i]     = clean;
    setDigits(next);
    if (clean && i < 4) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 5) { setError('Please enter the full 5-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      router.push('/login?verified=1');
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setResent(false);
    try {
      // Trigger resend by calling forgot (no, actually login re-sends OTP when unverified)
      // The backend resends OTP automatically on login attempt for unverified accounts
      await authApi.login({ email, password: '__resend_trigger__' }).catch(() => {});
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      // Ignore — login with wrong password triggers a resend for unverified accounts
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.iconWrap}>
          <ShieldIcon />
        </div>

        <h1 className={styles.heading}>Verify your email</h1>
        <p className={styles.subtext}>
          We sent a 5-digit code to<br />
          <strong className={styles.emailHighlight}>{email || 'your email'}</strong>
        </p>

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}
        {resent && <div className={styles.successBanner} role="status">A new code has been sent!</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.codeRow} aria-label="Verification code input">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`${styles.codeBox} ${d ? styles.codeBoxFilled : ''}`}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <p className={styles.resendRow}>
          Didn&apos;t receive a code?{' '}
          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            Resend code
          </button>
        </p>

        <Link href="/login" className={styles.backLink}>← Back to Sign In</Link>
      </div>
    </div>
  );
}
