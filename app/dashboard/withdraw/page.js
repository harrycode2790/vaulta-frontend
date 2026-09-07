'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { singleSavingsApi, duoSavingsApi, familySavingsApi } from '@/lib/api';
import styles from './page.module.css';

const Ic = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Alert:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Bitcoin:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.5 13.5H9v-3h4.5a1.5 1.5 0 0 1 0 3zM9 12V9h4a1.5 1.5 0 0 1 0 3z"/></svg>,
  Ethereum:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 12 12 22 22 12"/></svg>,
  Vault:     () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Users:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clock:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const VAULT_LABEL = { SINGLE: 'Single Vault', DUO: 'Duo Vault', FAMILY: 'Family Vault' };

export default function WithdrawPage() {
  const [plans,     setPlans]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState(null);
  const [amount,    setAmount]    = useState('');
  const [walletType, setWalletType] = useState('BITCOIN');
  const [address,   setAddress]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [singleRes, duoRes, familyRes] = await Promise.all([
        singleSavingsApi.getHistory(),
        duoSavingsApi.getMyPlans(),
        familySavingsApi.getMyPlans(),
      ]);
      const now = Date.now();
      const single = (singleRes.data ?? [])
        .filter((p) => p.status === 'ACTIVE' || p.status === 'MATURED')
        .map((p) => ({
          ...p, vaultType: 'SINGLE',
          eligible: p.status === 'MATURED' || new Date(p.maturityDate).getTime() <= now,
          available: p.status === 'MATURED' ? p.totalPayout : p.amountSaved,
        }));
      const duo = (duoRes.data ?? [])
        .filter((p) => p.status === 'ACTIVE' || p.status === 'MATURED')
        .map((p) => ({
          ...p, vaultType: 'DUO', eligible: true,
          available: p.status === 'MATURED' ? p.totalPayout : p.amountSaved,
        }));
      const family = (familyRes.data ?? [])
        .filter((p) => p.status === 'ACTIVE' || p.status === 'MATURED')
        .map((p) => ({
          ...p, vaultType: 'FAMILY', eligible: true,
          available: p.status === 'MATURED' ? p.totalPayout : p.amountSaved,
        }));
      setPlans([...single, ...duo, ...family]);
    } catch (err) {
      setError(err.message || 'Failed to load your vaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const num = parseFloat(amount) || 0;
  const maxAmount = selected?.available ?? 0;
  const valid = !!selected && selected.eligible && num > 0 && num <= maxAmount && address.trim().length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setSubmitting(true);
    try {
      const body = { amount: num, WalletType: walletType, walletAddress: address.trim() };
      if (selected.vaultType === 'SINGLE') {
        await singleSavingsApi.withdraw(selected.id, body);
      } else if (selected.vaultType === 'DUO') {
        await duoSavingsApi.requestWithdrawal(selected.id, body);
      } else {
        await familySavingsApi.requestWithdrawal(selected.id, body);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Withdrawal request failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSelected(null);
    setAmount('');
    setAddress('');
    setSubmitted(false);
    setError('');
    load();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}><Ic.ArrowLeft /> Back to Dashboard</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Withdraw</h1>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.pickerGrid}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard} style={{ height: 130 }} />)}
        </div>
      ) : submitted ? (
        <div className={styles.sectionCard}>
          <div className={styles.successBanner}>
            {selected.vaultType === 'SINGLE'
              ? 'Withdrawal request submitted and is pending admin approval.'
              : 'Withdrawal request submitted — waiting for the other participant(s) to approve.'}
          </div>
          <button type="button" className={styles.primaryBtn} onClick={reset}>Make Another Request</button>
        </div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.Vault /></div>
          <h3 className={styles.emptyTitle}>No vaults to withdraw from</h3>
          <p className={styles.hint}>Once you have an active or matured savings plan, it&apos;ll show up here.</p>
          <Link href="/dashboard/vaults" className={styles.primaryBtn}>View My Vaults</Link>
        </div>
      ) : (
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>1. Choose a plan</h2>
          <div className={styles.pickerGrid}>
            {plans.map((p) => (
              <button
                key={`${p.vaultType}-${p.id}`}
                type="button"
                className={`${styles.pickerCard} ${selected?.id === p.id ? styles.pickerCardActive : ''} ${!p.eligible ? styles.pickerCardDisabled : ''}`}
                onClick={() => p.eligible && setSelected(p)}
                disabled={!p.eligible}
              >
                <div className={styles.pickerCardHead}>
                  <span className={styles.pickerCardBadge}>{VAULT_LABEL[p.vaultType]}</span>
                  <span className={styles.pickerCardMeta}>{p.status}</span>
                </div>
                <span className={styles.pickerCardAmount}>{fmt(p.available)}</span>
                {!p.eligible && <span className={styles.pickerCardNote}>Not yet matured</span>}
                {p.eligible && p.status !== 'MATURED' && <span className={styles.pickerCardNote}>Early withdrawal — hasn&apos;t matured</span>}
              </button>
            ))}
          </div>

          {selected && (
            <form onSubmit={handleSubmit} className={styles.modalBody} style={{ padding: 0 }}>
              <h2 className={styles.sectionTitle} style={{ marginTop: 8 }}>2. Withdrawal details</h2>

              {selected.vaultType !== 'SINGLE' && (
                <div className={styles.approvalNote}>
                  <Ic.Users />
                  <span>All other participants in this vault must also approve before funds are released.</span>
                </div>
              )}
              {selected.status !== 'MATURED' && (
                <div className={styles.warningBox}>
                  <Ic.Alert />
                  <span>This plan hasn&apos;t matured yet. Early withdrawal may reduce interest earnings.</span>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>AMOUNT</label>
                <div className={styles.amountInputWrap}>
                  <span className={styles.currencyPrefix}>$</span>
                  <input
                    type="number" min="1" step="0.01" max={maxAmount}
                    className={styles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <button type="button" className={styles.maxBtn} onClick={() => setAmount(String(maxAmount))}>MAX</button>
                </div>
                <span className={styles.hint}>Available: {fmt(maxAmount)}</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>WALLET TYPE</label>
                <div className={styles.netToggleRow}>
                  <button type="button" className={`${styles.netToggle} ${walletType === 'BITCOIN' ? styles.netToggleActive : ''}`} onClick={() => setWalletType('BITCOIN')}>
                    <Ic.Bitcoin /> Bitcoin
                  </button>
                  <button type="button" className={`${styles.netToggle} ${walletType === 'ETHEREUM' ? styles.netToggleActive : ''}`} onClick={() => setWalletType('ETHEREUM')}>
                    <Ic.Ethereum /> Ethereum
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>YOUR WALLET ADDRESS</label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder={walletType === 'BITCOIN' ? 'bc1q…' : '0x…'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  spellCheck={false}
                />
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={submitting || !valid}>
                {submitting ? 'Submitting…' : 'Submit Withdrawal Request'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
