'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

function LockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const email   = params.get('email') || '';

  const [digits, setDigits]       = useState(['', '', '', '', '']);
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const inputs = useRef([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  function handleDigit(i, val) {
    if (val.length > 1) {
      const chars = val.replace(/\D/g, '').slice(0, 5).split('');
      const next  = [...digits];
      chars.forEach((c, idx) => { if (idx < 5) next[idx] = c; });
      setDigits(next);
      inputs.current[Math.min(chars.length, 4)]?.focus();
      return;
    }
    const clean = val.replace(/\D/g, '');
    const next  = [...digits]; next[i] = clean;
    setDigits(next);
    if (clean && i < 4) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 5) { setError('Please enter the full 5-digit reset code.'); return; }
    if (password.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/login?reset=1'), 1500);
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <Link href="/" className={styles.logo}>Vaulta</Link>

        <div className={styles.iconWrap}><LockIcon /></div>

        <h1 className={styles.heading}>Reset your password</h1>
        <p className={styles.subtext}>
          Enter the code sent to <strong className={styles.emailHighlight}>{email}</strong> and your new password.
        </p>

        {error   && <div className={styles.errorBanner}   role="alert">{error}</div>}
        {success && <div className={styles.successBanner} role="status">Password reset! Redirecting to login…</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* OTP row */}
          <div className={styles.fieldGroup}>
            <span className={styles.label}>RESET CODE</span>
            <div className={styles.codeRow}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={5}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`${styles.codeBox} ${d ? styles.codeBoxFilled : ''}`}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* New password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="newPassword">NEW PASSWORD</label>
            <div className={styles.inputWrapper}>
              <input
                id="newPassword"
                type={showPass ? 'text' : 'password'}
                className={`${styles.input} ${styles.inputWithToggle}`}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide' : 'Show'}>
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || success}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className={styles.resendRow}>
          Didn&apos;t get a code?{' '}
          <Link href="/forgot-password" className={styles.resendLink}>Request another</Link>
        </p>

        <Link href="/login" className={styles.backLink}>← Back to Sign In</Link>
      </div>
    </div>
  );
}
