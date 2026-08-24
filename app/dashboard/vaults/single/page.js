'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { singleSavingsApi } from '@/lib/api';
import styles from './page.module.css';

/* ══════════════════════════════
   Icons
   ══════════════════════════════ */
const Ic = {
  ArrowLeft:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Copy:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Close:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Zap:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Wallet:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  TrendUp:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Alert:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Clock:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Bitcoin:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.5 13.5H9v-3h4.5a1.5 1.5 0 0 1 0 3zM9 12V9h4a1.5 1.5 0 0 1 0 3z"/></svg>,
  Ethereum:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 12 12 22 22 12"/></svg>,
  History:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
};

/* ══════════════════════════════
   Helpers
   ══════════════════════════════ */
function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function maturityProgress(startDate, maturityDate) {
  const now   = Date.now();
  const start = new Date(startDate).getTime();
  const end   = new Date(maturityDate).getTime();
  if (now >= end) return 100;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}

function isReadyToMature(plan) {
  return plan.status === 'ACTIVE' && new Date() >= new Date(plan.maturityDate);
}

function truncate(str, len = 18) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, 8) + '…' + str.slice(-6);
}

function statusColor(status) {
  if (status === 'ACTIVE')    return styles.statusActive;
  if (status === 'MATURED')   return styles.statusMatured;
  if (status === 'WITHDRAWN') return styles.statusWithdrawn;
  if (status === 'PENDING')   return styles.statusPending;
  if (status === 'REJECTED')  return styles.statusRejected;
  return styles.statusActive;
}

/* ══════════════════════════════
   Copy button
   ══════════════════════════════ */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button className={styles.copyBtn} onClick={handleCopy} title="Copy to clipboard">
      {copied ? <Ic.Check /> : <Ic.Copy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ══════════════════════════════
   Create Modal
   ══════════════════════════════ */
function CreateModal({ onClose, onCreated }) {
  const [step,     setStep]     = useState(1);
  const [amount,   setAmount]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [result,   setResult]   = useState(null);
  const [selNet,   setSelNet]   = useState('bitcoin');

  const num        = parseFloat(amount) || 0;
  const interest   = +(num * 0.10).toFixed(2);
  const totalPayout = +(num + interest).toFixed(2);
  const valid      = num >= 100;

  async function handleCreate(e) {
    e.preventDefault();
    if (!valid) { setError('Minimum savings amount is $100'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await singleSavingsApi.create({ amount: num });
      setResult(res.data);
      setStep(2);
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create plan. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const payDetails = result?.paymentDetails;
  const netInfo    = selNet === 'bitcoin' ? payDetails?.bitcoin : payDetails?.ethereum;

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {step === 1 ? 'Create Solo Vault' : 'Make Payment'}
            </h2>
            <p className={styles.modalSub}>
              {step === 1
                ? 'Set your savings amount — minimum $100'
                : `Send exactly ${fmt(num)} to activate your plan`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        {/* Step indicator */}
        <div className={styles.stepRow}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDone : ''}`}>1</div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDone : ''}`}>2</div>
        </div>

        {/* ── Step 1: Amount ── */}
        {step === 1 && (
          <form onSubmit={handleCreate} className={styles.modalBody}>
            {error && <div className={styles.errorBanner} role="alert">{error}</div>}

            <div className={styles.field}>
              <label className={styles.label}>SAVINGS AMOUNT</label>
              <div className={styles.amountInputWrap}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  type="number" min="100" step="0.01"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
              <span className={styles.hint}>Minimum deposit: $100.00</span>
            </div>

            {/* Live preview */}
            {num >= 100 && (
              <div className={styles.previewCard}>
                <h3 className={styles.previewTitle}>Earnings Preview</h3>
                <div className={styles.previewRows}>
                  <div className={styles.previewRow}>
                    <span>Principal</span>
                    <span>{fmt(num)}</span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewGreen}>10% Interest (MPY)</span>
                    <span className={styles.previewGreen}>+ {fmt(interest)}</span>
                  </div>
                  <div className={styles.previewDivider} />
                  <div className={`${styles.previewRow} ${styles.previewTotal}`}>
                    <span>Total Payout</span>
                    <span>{fmt(totalPayout)}</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid}>
              {loading ? 'Creating…' : 'Create Plan →'}
            </button>
          </form>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 2 && payDetails && (
          <div className={styles.modalBody}>

            <div className={styles.payPlanSummary}>
              <span className={styles.payPlanLabel}>Plan Created</span>
              <span className={styles.payPlanAmount}>{fmt(num)} principal · {fmt(interest)} interest</span>
            </div>

            <div className={styles.warningBox}>
              <Ic.Clock />
              <span>Your plan is pending admin approval and will activate once approved.</span>
            </div>

            {/* Network selector */}
            <div className={styles.netToggleRow}>
              <button
                className={`${styles.netToggle} ${selNet === 'bitcoin' ? styles.netToggleActive : ''}`}
                onClick={() => setSelNet('bitcoin')}
              >
                <Ic.Bitcoin /> Bitcoin
              </button>
              <button
                className={`${styles.netToggle} ${selNet === 'ethereum' ? styles.netToggleActive : ''}`}
                onClick={() => setSelNet('ethereum')}
              >
                <Ic.Ethereum /> Ethereum
              </button>
            </div>

            {/* Address card */}
            {netInfo && (
              <div className={styles.addressCard}>
                <div className={styles.addressLabel}>
                  <span className={styles.networkBadge}>{netInfo.network}</span>
                  <span className={styles.addressMeta}>Send exactly {fmt(netInfo.amountToPay)}</span>
                </div>
                <div className={styles.addressRow}>
                  <code className={styles.addressCode}>{netInfo.address}</code>
                  <CopyBtn text={netInfo.address} />
                </div>
              </div>
            )}

            <div className={styles.warningBox}>
              <Ic.Alert />
              <span>Send the exact amount shown. Sending a different amount may result in an unconfirmed plan.</span>
            </div>

            <button className={styles.primaryBtn} onClick={onClose}>
              Done — I&apos;ve Made Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Withdraw Modal
   ══════════════════════════════ */
function WithdrawModal({ plan, onClose, onSuccess }) {
  const [amount,      setAmount]      = useState('');
  const [walletType,  setWalletType]  = useState('BITCOIN');
  const [address,     setAddress]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const isMatured  = plan.status === 'MATURED';
  const maxAmount  = isMatured ? plan.totalPayout : plan.amountSaved;
  const num        = parseFloat(amount) || 0;
  const valid      = num > 0 && num <= maxAmount && address.trim().length > 0;

  async function handleWithdraw(e) {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      await singleSavingsApi.withdraw(plan.id, {
        amount: num,
        WalletType: walletType,
        walletAddress: address.trim(),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Withdraw Funds</h2>
            <p className={styles.modalSub}>
              Available: {fmt(maxAmount)}
              {isMatured ? ' (matured payout)' : ' (principal)'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        <form onSubmit={handleWithdraw} className={styles.modalBody}>

          {!isMatured && (
            <div className={styles.warningBox}>
              <Ic.Alert />
              <span>This plan hasn&apos;t matured yet. Early withdrawal will reduce your interest earnings on the withdrawn amount.</span>
            </div>
          )}

          {error   && <div className={styles.errorBanner} role="alert">{error}</div>}
          {success && <div className={styles.successBanner} role="status">Withdrawal request submitted and is pending admin approval! Redirecting…</div>}

          {/* Amount */}
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
              <button
                type="button"
                className={styles.maxBtn}
                onClick={() => setAmount(String(maxAmount))}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Wallet type */}
          <div className={styles.field}>
            <label className={styles.label}>WALLET TYPE</label>
            <div className={styles.netToggleRow}>
              <button
                type="button"
                className={`${styles.netToggle} ${walletType === 'BITCOIN' ? styles.netToggleActive : ''}`}
                onClick={() => setWalletType('BITCOIN')}
              >
                <Ic.Bitcoin /> Bitcoin
              </button>
              <button
                type="button"
                className={`${styles.netToggle} ${walletType === 'ETHEREUM' ? styles.netToggleActive : ''}`}
                onClick={() => setWalletType('ETHEREUM')}
              >
                <Ic.Ethereum /> Ethereum
              </button>
            </div>
          </div>

          {/* Wallet address */}
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

          <div className={styles.modalFooter}>
            <button type="button" className={styles.ghostBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid || success}>
              {loading ? 'Processing…' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Plan card
   ══════════════════════════════ */
function PlanCard({ plan, onWithdraw, onRefresh }) {
  const [yieldData,  setYieldData]  = useState(null);
  const [checking,   setChecking]   = useState(false);
  const [yieldError, setYieldError] = useState('');

  const progress  = maturityProgress(plan.startDate, plan.maturityDate);
  const readyNow  = isReadyToMature(plan);

  async function checkYield() {
    setChecking(true);
    setYieldError('');
    try {
      const res = await singleSavingsApi.getTotalYield(plan.id);
      setYieldData(res.data);
      onRefresh();
    } catch (err) {
      setYieldError(err.message || 'Could not check yield');
    } finally {
      setChecking(false);
    }
  }

  return (
    <article className={`${styles.planCard} ${plan.status === 'MATURED' ? styles.planCardMatured : ''} ${plan.status === 'WITHDRAWN' ? styles.planCardWithdrawn : ''}`}>

      {/* Card header */}
      <div className={styles.cardHead}>
        <span className={`${styles.statusBadge} ${statusColor(plan.status)}`}>
          {readyNow && plan.status === 'ACTIVE' ? 'READY TO MATURE' : plan.status}
        </span>
        <span className={styles.rateBadge}>10% MPY</span>
      </div>

      {/* Amounts */}
      <div className={styles.amountBlock}>
        <div className={styles.principalAmount}>{fmt(plan.amountSaved)}</div>
        <div className={styles.amountLabel}>Amount Saved</div>
      </div>

      <div className={styles.yieldRow}>
        <div className={styles.yieldItem}>
          <span className={styles.yieldItemLabel}>Expected Interest</span>
          <span className={styles.yieldItemValue} style={{ color: '#16a34a' }}>+ {fmt(plan.expectedInterest)}</span>
        </div>
        <div className={styles.yieldSep} />
        <div className={styles.yieldItem}>
          <span className={styles.yieldItemLabel}>Total Payout</span>
          <span className={styles.yieldItemValue}>{fmt(plan.totalPayout)}</span>
        </div>
      </div>

      {/* Progress bar */}
      {plan.status !== 'WITHDRAWN' && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${progress >= 100 ? styles.progressDone : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.dateLabel}>
              <Ic.Clock /> Started {fmtDate(plan.startDate)}
            </span>
            <span className={styles.dateLabel}>
              Matures {fmtDate(plan.maturityDate)}
            </span>
          </div>
        </div>
      )}

      {/* Yield check result */}
      {yieldError && <div className={styles.errorBanner} style={{ marginTop: '12px' }}>{yieldError}</div>}
      {yieldData && (
        <div className={styles.yieldResult}>
          <Ic.TrendUp />
          <span>{yieldData.message} — <strong>{fmt(yieldData.total)}</strong></span>
        </div>
      )}

      {/* Actions */}
      {plan.status !== 'WITHDRAWN' && (
        <div className={styles.cardActions}>
          {(plan.status === 'ACTIVE') && (
            <button
              className={`${styles.checkBtn} ${readyNow ? styles.checkBtnReady : ''}`}
              onClick={checkYield}
              disabled={checking}
            >
              {checking ? 'Checking…' : readyNow ? '✦ Claim Yield' : 'Check Yield'}
            </button>
          )}
          {(plan.status === 'ACTIVE' || plan.status === 'MATURED') && (
            <button
              className={styles.withdrawBtn}
              onClick={() => onWithdraw(plan)}
              disabled={plan.amountSaved <= 0 && plan.totalPayout <= 0}
            >
              Withdraw
            </button>
          )}
        </div>
      )}

      {plan.status === 'PENDING' && (
        <div className={styles.withdrawnBadge}>Pending admin approval</div>
      )}

      {plan.status === 'REJECTED' && (
        <div className={styles.withdrawnBadge}>Rejected by admin</div>
      )}

      {plan.status === 'WITHDRAWN' && (
        <div className={styles.withdrawnBadge}>Plan completed and withdrawn</div>
      )}
    </article>
  );
}

/* ══════════════════════════════
   Withdrawal history table
   ══════════════════════════════ */
function WithdrawalHistory({ items }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.historySection}>
      <div className={styles.historySectionHead}>
        <Ic.History />
        <h2 className={styles.historySectionTitle}>Withdrawal History</h2>
        <span className={styles.historyCount}>{items.length}</span>
      </div>
      <div className={styles.historyTable}>
        <div className={styles.historyHeaderRow}>
          <span>Date</span>
          <span>Amount</span>
          <span>Wallet</span>
          <span>Address</span>
          <span>Status</span>
        </div>
        {items.map((w) => (
          <div key={w.id} className={styles.historyRow}>
            <span className={styles.historyDate}>{fmtDateTime(w.createdAt)}</span>
            <span className={styles.historyAmount}>{fmt(w.amount)}</span>
            <span className={styles.historyWallet}>{w.WalletType ?? '—'}</span>
            <span className={styles.historyAddress} title={w.walletAddress}>{truncate(w.walletAddress)}</span>
            <span className={`${styles.historyStatus} ${w.status === 'SUCCESSFUL' ? styles.statusDone : w.status === 'REJECTED' ? styles.statusRej : styles.statusPend}`}>{w.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Page
   ══════════════════════════════ */
export default function SingleSavingsPage() {
  const [plans,       setPlans]       = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showCreate,  setShowCreate]  = useState(false);
  const [withdrawPlan, setWithdrawPlan] = useState(null);

  const load = useCallback(async () => {
    try {
      const [plansRes, withdrawRes] = await Promise.all([
        singleSavingsApi.getHistory(),
        singleSavingsApi.getWithdrawalHistory(),
      ]);
      setPlans(plansRes.data ?? []);
      setWithdrawals(withdrawRes.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Summary stats
  const activePlans  = plans.filter((p) => p.status === 'ACTIVE');
  const maturedPlans = plans.filter((p) => p.status === 'MATURED');
  const totalSaved   = plans.reduce((s, p) => s + (p.amountSaved || 0), 0);
  const totalYield   = plans.reduce((s, p) => s + (p.expectedInterest || 0), 0);
  const totalPayout  = plans.reduce((s, p) => s + (p.totalPayout || 0), 0);

  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/vaults" className={styles.backLink}>
            <Ic.ArrowLeft /> My Vaults
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Solo Vault</h1>
            <span className={styles.mpyBadge}>10% MPY</span>
          </div>
          <p className={styles.pageSub}>Fixed-rate individual savings with guaranteed compound returns.</p>
        </div>
        <button className={styles.newPlanBtn} onClick={() => setShowCreate(true)}>
          <Ic.Plus /> New Plan
        </button>
      </div>

      {/* ── Error ── */}
      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {/* ── Stats row (only when plans exist) ── */}
      {!loading && plans.length > 0 && (
        <div className={styles.statsRow}>
          {[
            { label: 'Total Deposited', value: fmt(totalSaved),  Icon: Ic.Wallet },
            { label: 'Yield Earned',    value: fmt(totalYield),  Icon: Ic.TrendUp },
            { label: 'Total Value',     value: fmt(totalPayout), Icon: Ic.Zap },
            { label: 'Active Plans',    value: `${activePlans.length} active · ${maturedPlans.length} matured`, Icon: Ic.Clock },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon}><s.Icon /></div>
              <div className={styles.statText}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.Zap /></div>
          <h2 className={styles.emptyTitle}>No savings plans yet</h2>
          <p className={styles.emptySub}>Create your first Solo Vault to start earning 10% compound interest.</p>
          <button className={styles.newPlanBtn} onClick={() => setShowCreate(true)}>
            <Ic.Plus /> Create First Plan
          </button>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onWithdraw={(p) => setWithdrawPlan(p)}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {/* ── Withdrawal history ── */}
      {!loading && <WithdrawalHistory items={withdrawals} />}

      {/* ── Modals ── */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
      {withdrawPlan && (
        <WithdrawModal
          plan={withdrawPlan}
          onClose={() => setWithdrawPlan(null)}
          onSuccess={load}
        />
      )}

    </div>
  );
}
