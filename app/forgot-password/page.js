'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

function MailIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [email,   setEmail]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Could not send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <Link href="/" className={styles.logo}>Vaulta</Link>

        <div className={styles.iconWrap}>
          <MailIcon />
        </div>

        <h1 className={styles.heading}>Forgot your password?</h1>
        <p className={styles.subtext}>
          Enter your email address and we&apos;ll send you a reset code.
        </p>

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}
        {sent  && <div className={styles.successBanner} role="status">Reset code sent! Redirecting…</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email" type="email"
              className={styles.input}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || sent}>
            {loading ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>

        <Link href="/login" className={styles.backLink}>← Back to Sign In</Link>
      </div>
    </div>
  );
}
