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
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="rgba(111,207,151,0.4)" strokeWidth="1" />
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

const plans = [
  { id: 'solo',   label: 'Solo Saver',       rate: '10%', desc: 'For individuals' },
  { id: 'duo',    label: 'Double the Growth', rate: '15%', desc: 'For partners',   popular: true },
  { id: 'family', label: 'Household Wealth',  rate: '30%', desc: 'For families' },
];
const perks = [
  'No minimum deposit required',
  'Cancel or switch plans anytime',
  'FDIC insured up to $250,000',
  'Setup takes under 3 minutes',
];
const testimonial = {
  quote: "Vaulta helped us go from zero savings to a six-month emergency fund in under a year.",
  name: 'Sarah & Marcus T.',
  detail: 'Duo plan · Member since 2022',
};

export default function SignupPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('duo');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const payload = {
      firstname: form.firstName.value.trim(),
      lastname:  form.lastName.value.trim(),
      username:  form.username.value.trim(),
      email:     form.email.value.trim(),
      password:  form.password.value,
    };

    try {
      const data = await authApi.register(payload);
      // Backend returns the email and OTP expiry — go to verify page
      const email = data.data?.email || payload.email;
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      // Surface Joi validation errors if present
      const details = err.data?.errors;
      if (details && typeof details === 'object') {
        const first = Object.values(details)[0];
        setError(Array.isArray(first) ? first[0] : first);
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Left: brand panel (sticky) ── */}
      <aside className={styles.brand}>
        <div className={styles.brandInner}>
          <Link href="/" className={styles.brandLogo}>Vaulta</Link>
          <div className={styles.brandBody}>
            <p className={styles.brandEyebrow}>Start for free today</p>
            <h2 className={styles.brandHeading}>
              Build wealth,<br />
              <span className={styles.brandAccent}>your way.</span>
            </h2>
            <p className={styles.brandSubtext}>
              Choose the plan that fits your life. Every plan includes
              automated savings, real-time tracking, and zero hidden fees.
            </p>
            <ul className={styles.perkList}>
              {perks.map((p) => (
                <li key={p} className={styles.perkItem}><CheckIcon />{p}</li>
              ))}
            </ul>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>&ldquo;{testimonial.quote}&rdquo;</p>
            <div className={styles.testimonialMeta}>
              <div className={styles.testimonialAvatar} aria-hidden="true">{testimonial.name.charAt(0)}</div>
              <div>
                <div className={styles.testimonialName}>{testimonial.name}</div>
                <div className={styles.testimonialDetail}>{testimonial.detail}</div>
              </div>
            </div>
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
            <h1 className={styles.heading}>Create your account</h1>
            <p className={styles.subtext}>Get started in under 3 minutes — no credit card needed.</p>
          </div>

          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Name row */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="firstName">FIRST NAME</label>
                <input id="firstName" name="firstName" type="text" className={styles.input} placeholder="Jane" autoComplete="given-name" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="lastName">LAST NAME</label>
                <input id="lastName" name="lastName" type="text" className={styles.input} placeholder="Smith" autoComplete="family-name" required />
              </div>
            </div>

            {/* Username */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">USERNAME</label>
              <input id="username" name="username" type="text" className={styles.input} placeholder="janesmith" autoComplete="username" required />
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">EMAIL ADDRESS</label>
              <input id="email" name="email" type="email" className={styles.input} placeholder="name@company.com" autoComplete="email" required />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">PASSWORD</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Plan selector (UX only — plan is set when creating a savings vault) */}
            <div className={styles.planSection}>
              <span className={styles.label}>SELECT YOUR PLAN</span>
              <div className={styles.planGrid}>
                {plans.map((plan) => (
                  <button
                    key={plan.id} type="button"
                    className={`${styles.planCard} ${selectedPlan === plan.id ? styles.planCardActive : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && <span className={styles.planPopular}>Popular</span>}
                    <span className={styles.planRate}>{plan.rate}</span>
                    <span className={styles.planMpy}>MPY</span>
                    <span className={styles.planName}>{plan.label}</span>
                    <span className={styles.planDesc}>{plan.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className={styles.termsRow}>
              <input type="checkbox" name="terms" className={styles.checkbox} required />
              <span className={styles.termsText}>
                I agree to the{' '}
                <Link href="/terms" className={styles.termsLink}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
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

          <p className={styles.signinRow}>
            Already have an account?{' '}
            <Link href="/login" className={styles.signinLink}>Sign In</Link>
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
