'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { duoSavingsApi, familySavingsApi } from '@/lib/api';
import CryptoPaymentCard from '@/components/CryptoPaymentCard';
import styles from './page.module.css';

/* ══════════════════════════════
   Icons
   ══════════════════════════════ */
const Ic = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Clock:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Alert:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Vault:     () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Users:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* Crypto payment step — mirrors the pattern already used on the vault pages,
   using the real paymentDetails returned by the deposit response. */
function PaymentStep({ amount, interestRate, paymentDetails, onDone }) {
  const interest = +(amount * (interestRate / 100)).toFixed(2);

  return (
    <div className={styles.modalBody}>
      <div className={styles.payPlanSummary}>
        <span className={styles.payPlanLabel}>DEPOSIT REQUESTED</span>
        <span className={styles.payPlanAmount}>{fmt(amount)} · {fmt(interest)} expected interest</span>
      </div>

      <div className={styles.approvalNote}>
        <Ic.Clock />
        <span>Your deposit is pending admin approval and will reflect in your balance once approved.</span>
      </div>

      <CryptoPaymentCard bitcoin={paymentDetails?.bitcoin} ethereum={paymentDetails?.ethereum} />

      <div className={styles.warningBox}>
        <Ic.Alert />
        <span>Send the exact amount shown. Sending a different amount may delay approval.</span>
      </div>

      <button type="button" className={styles.primaryBtn} onClick={onDone}>
        Done — I&apos;ve Made Payment
      </button>
    </div>
  );
}

export default function DepositPage() {
  const [plans,    setPlans]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);
  const [amount,   setAmount]   = useState('');
  const [step,     setStep]     = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result,   setResult]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [duoRes, familyRes] = await Promise.all([
        duoSavingsApi.getMyPlans(),
        familySavingsApi.getMyPlans(),
      ]);
      const now = Date.now();
      const eligible = [
        ...(duoRes.data ?? []).map((p) => ({ ...p, vaultType: 'DUO' })),
        ...(familyRes.data ?? []).map((p) => ({ ...p, vaultType: 'FAMILY' })),
      ].filter((p) => p.status === 'ACTIVE' && new Date(p.maturityDate).getTime() > now);
      setPlans(eligible);
    } catch (err) {
      setError(err.message || 'Failed to load your vaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const num = parseFloat(amount) || 0;
  const valid = num > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected || !valid) return;
    setError('');
    setSubmitting(true);
    try {
      const api = selected.vaultType === 'DUO' ? duoSavingsApi : familySavingsApi;
      const res = await api.deposit(selected.id, { amount: num });
      setResult(res.data);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Deposit request failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSelected(null);
    setAmount('');
    setStep(1);
    setResult(null);
    setError('');
    load();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}><Ic.ArrowLeft /> Back to Dashboard</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Deposit</h1>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.pickerGrid}>
          {[1, 2].map((i) => <div key={i} className={styles.skeletonCard} style={{ height: 130 }} />)}
        </div>
      ) : step === 2 && result ? (
        <div className={styles.sectionCard}>
          <PaymentStep
            amount={num}
            interestRate={selected.interestRate}
            paymentDetails={result.paymentDetails}
            onDone={reset}
          />
        </div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.Vault /></div>
          <h3 className={styles.emptyTitle}>No eligible vault yet</h3>
          <p className={styles.hint}>
            You need an active Duo or Family vault to deposit into — Single vaults are one-time and can&apos;t be topped up.
          </p>
          <Link href="/dashboard/vaults" className={styles.primaryBtn}>Create a Vault</Link>
        </div>
      ) : (
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>1. Choose a vault</h2>
          <div className={styles.pickerGrid}>
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.pickerCard} ${selected?.id === p.id ? styles.pickerCardActive : ''}`}
                onClick={() => setSelected(p)}
              >
                <div className={styles.pickerCardHead}>
                  <span className={styles.pickerCardBadge}>{p.vaultType === 'DUO' ? 'Duo Vault' : 'Family Vault'}</span>
                  <span className={styles.pickerCardMeta}>{p.interestRate}% MPY</span>
                </div>
                <span className={styles.pickerCardAmount}>{fmt(p.amountSaved)}</span>
                <span className={styles.pickerCardMeta}>Matures {fmtDate(p.maturityDate)}</span>
              </button>
            ))}
          </div>

          {selected && (
            <form onSubmit={handleSubmit} className={styles.modalBody} style={{ padding: 0 }}>
              <h2 className={styles.sectionTitle} style={{ marginTop: 8 }}>2. Deposit amount</h2>
              <div className={styles.field}>
                <label className={styles.label}>DEPOSIT AMOUNT</label>
                <div className={styles.amountInputWrap}>
                  <span className={styles.currencyPrefix}>$</span>
                  <input
                    type="number" min="1" step="0.01"
                    className={styles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
                <span className={styles.hint}>Current balance: {fmt(selected.amountSaved)}</span>
              </div>

              {num > 0 && (
                <div className={styles.previewCard}>
                  <h3 className={styles.previewTitle}>DEPOSIT REQUEST</h3>
                  <div className={styles.previewRows}>
                    <div className={styles.previewRow}><span>Current Balance</span><span>{fmt(selected.amountSaved)}</span></div>
                    <div className={styles.previewRow}><span className={styles.previewGreen}>Requested Deposit</span><span className={styles.previewGreen}>+ {fmt(num)}</span></div>
                    <div className={styles.previewDivider} />
                    <div className={`${styles.previewRow} ${styles.previewTotal}`}><span>Balance After Approval</span><span>{fmt(selected.amountSaved + num)}</span></div>
                  </div>
                </div>
              )}

              <button type="submit" className={styles.primaryBtn} disabled={submitting || !valid}>
                {submitting ? 'Submitting…' : 'Continue to Payment →'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
