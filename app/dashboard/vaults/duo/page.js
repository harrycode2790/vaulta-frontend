'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { duoSavingsApi, authApi } from '@/lib/api';
import styles from './page.module.css';

/* ══════════════════════════════
   Icons
   ══════════════════════════════ */
const Ic = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Copy:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Close:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Zap:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Users:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Wallet:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  TrendUp:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Bell:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Alert:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Crown:     () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>,
  Bitcoin:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.5 13.5H9v-3h4.5a1.5 1.5 0 0 1 0 3zM9 12V9h4a1.5 1.5 0 0 1 0 3z"/></svg>,
  Ethereum:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 12 12 22 22 12"/></svg>,
  History:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  ChevDown:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevUp:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  Search:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  UserPlus:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Download:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
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
function initials(u) {
  if (!u) return '?';
  return u.username?.[0]?.toUpperCase() || '?';
}
function maturityProgress(created, maturity) {
  const now   = Date.now();
  const start = new Date(created).getTime();
  const end   = new Date(maturity).getTime();
  if (now >= end) return 100;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}
function truncate(str, len = 18) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, 8) + '…' + str.slice(-6);
}
function statusColor(s) {
  if (s === 'ACTIVE')    return styles.statusActive;
  if (s === 'MATURED')   return styles.statusMatured;
  if (s === 'WITHDRAWN') return styles.statusWithdrawn;
  if (s === 'PENDING')   return styles.statusPending;
  if (s === 'REJECTED')  return styles.statusRejected;
  return styles.statusActive;
}
function depositStatusClass(status) {
  if (status === 'APPROVED') return styles.statusDone;
  if (status === 'REJECTED') return styles.statusRej;
  return styles.statusPend;
}

/* ══════════════════════════════
   CopyBtn
   ══════════════════════════════ */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className={styles.copyBtn} onClick={() => {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }}>
      {copied ? <Ic.Check /> : <Ic.Copy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ══════════════════════════════
   Payment Step (shared)
   ══════════════════════════════ */
function PaymentStep({ amount, paymentDetails, onDone, note }) {
  const [selNet, setSelNet] = useState('bitcoin');
  const netInfo = selNet === 'bitcoin' ? paymentDetails?.bitcoin : paymentDetails?.ethereum;
  const interest = +(amount * 0.15).toFixed(2);
  return (
    <div className={styles.modalBody}>
      <div className={styles.payPlanSummary}>
        <span className={styles.payPlanLabel}>PLAN CREATED</span>
        <span className={styles.payPlanAmount}>{fmt(amount)} principal · {fmt(interest)} expected interest</span>
      </div>

      {note && (
        <div className={styles.approvalNote}>
          <Ic.Clock />
          <span>{note}</span>
        </div>
      )}

      <div className={styles.netToggleRow}>
        <button className={`${styles.netToggle} ${selNet === 'bitcoin' ? styles.netToggleActive : ''}`} onClick={() => setSelNet('bitcoin')}>
          <Ic.Bitcoin /> Bitcoin
        </button>
        <button className={`${styles.netToggle} ${selNet === 'ethereum' ? styles.netToggleActive : ''}`} onClick={() => setSelNet('ethereum')}>
          <Ic.Ethereum /> Ethereum
        </button>
      </div>

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

      <button className={styles.primaryBtn} onClick={onDone}>
        Done — I&apos;ve Made Payment
      </button>
    </div>
  );
}

/* ══════════════════════════════
   Create Modal
   ══════════════════════════════ */
function CreateModal({ onClose, onCreated }) {
  const [step,    setStep]    = useState(1);
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [result,  setResult]  = useState(null);

  const num      = parseFloat(amount) || 0;
  const interest = +(num * 0.15).toFixed(2);
  const payout   = +(num + interest).toFixed(2);
  const valid    = num >= 200;

  async function handleCreate(e) {
    e.preventDefault();
    if (!valid) { setError('Minimum savings amount is $200'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await duoSavingsApi.create({ amount: num });
      setResult(res.data);
      setStep(2);
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create plan. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{step === 1 ? 'Create Duo Vault' : 'Make Payment'}</h2>
            <p className={styles.modalSub}>
              {step === 1 ? 'Set your savings amount — minimum $200' : `Send exactly ${fmt(num)} to activate your plan`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        <div className={styles.stepRow}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDone : ''}`}>1</div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDone : ''}`}>2</div>
        </div>

        {step === 1 && (
          <form onSubmit={handleCreate} className={styles.modalBody}>
            {error && <div className={styles.errorBanner} role="alert">{error}</div>}

            <div className={styles.field}>
              <label className={styles.label}>SAVINGS AMOUNT</label>
              <div className={styles.amountInputWrap}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  type="number" min="200" step="0.01"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
              <span className={styles.hint}>Minimum deposit: $200.00 · 15% MPY</span>
            </div>

            {num >= 200 && (
              <div className={styles.previewCard}>
                <h3 className={styles.previewTitle}>EARNINGS PREVIEW</h3>
                <div className={styles.previewRows}>
                  <div className={styles.previewRow}><span>Principal</span><span>{fmt(num)}</span></div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewGreen}>15% Interest (MPY)</span>
                    <span className={styles.previewGreen}>+ {fmt(interest)}</span>
                  </div>
                  <div className={styles.previewDivider} />
                  <div className={`${styles.previewRow} ${styles.previewTotal}`}><span>Total Payout</span><span>{fmt(payout)}</span></div>
                </div>
              </div>
            )}

            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid}>
              {loading ? 'Creating…' : 'Create Plan →'}
            </button>
          </form>
        )}

        {step === 2 && result?.paymentDetails && (
          <PaymentStep
            amount={num}
            paymentDetails={result.paymentDetails}
            onDone={onClose}
            note="Your plan is pending admin approval and will activate once approved."
          />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Deposit Modal
   ══════════════════════════════ */
function DepositModal({ plan, onClose, onSuccess }) {
  const [step,    setStep]    = useState(1);
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [result,  setResult]  = useState(null);

  const num   = parseFloat(amount) || 0;
  const valid = num > 0;

  async function handleDeposit(e) {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      const res = await duoSavingsApi.deposit(plan.id, { amount: num });
      setResult(res.data);
      setStep(2);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Deposit failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{step === 1 ? 'Add Deposit' : 'Make Payment'}</h2>
            <p className={styles.modalSub}>
              {step === 1 ? 'Deposit more into this Duo Vault' : `Send exactly ${fmt(num)} to complete your deposit`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        <div className={styles.stepRow}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDone : ''}`}>1</div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDone : ''}`}>2</div>
        </div>

        {step === 1 && (
          <form onSubmit={handleDeposit} className={styles.modalBody}>
            {error && <div className={styles.errorBanner} role="alert">{error}</div>}
            <div className={styles.field}>
              <label className={styles.label}>DEPOSIT AMOUNT</label>
              <div className={styles.amountInputWrap}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  type="number" min="1" step="0.01"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
              <span className={styles.hint}>Current balance: {fmt(plan.amountSaved)} · 15% MPY</span>
            </div>

            {num > 0 && (
              <div className={styles.previewCard}>
                <h3 className={styles.previewTitle}>DEPOSIT REQUEST</h3>
                <div className={styles.previewRows}>
                  <div className={styles.previewRow}><span>Current Balance</span><span>{fmt(plan.amountSaved)}</span></div>
                  <div className={styles.previewRow}><span className={styles.previewGreen}>Requested Deposit</span><span className={styles.previewGreen}>+ {fmt(num)}</span></div>
                  <div className={styles.previewDivider} />
                  <div className={`${styles.previewRow} ${styles.previewTotal}`}><span>Balance After Approval</span><span>{fmt(plan.amountSaved + num)}</span></div>
                </div>
              </div>
            )}

            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid}>
              {loading ? 'Processing…' : 'Continue to Payment →'}
            </button>
          </form>
        )}

        {step === 2 && result?.paymentDetails && (
          <PaymentStep
            amount={num}
            paymentDetails={result.paymentDetails}
            onDone={onClose}
            note="Your deposit is pending admin approval and will reflect in your balance once approved."
          />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Invite Modal
   ══════════════════════════════ */
function InviteModal({ plan, onClose, onSuccess }) {
  const [query,     setQuery]     = useState('');
  const [found,     setFound]     = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [sent,      setSent]      = useState(false);
  const timerRef = useRef(null);

  function handleQueryChange(e) {
    const v = e.target.value;
    setQuery(v);
    setFound(null);
    setSearchErr('');
    clearTimeout(timerRef.current);
    if (!v.trim()) return;
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await authApi.findUser(v.trim());
        setFound(res.data?.user ?? null);
      } catch {
        setSearchErr('No user found with that username.');
        setFound(null);
      } finally {
        setSearching(false);
      }
    }, 500);
  }

  async function handleInvite() {
    if (!found) return;
    setError('');
    setLoading(true);
    try {
      await duoSavingsApi.invite(plan.id, { invitedUserId: found.id });
      setSent(true);
      onSuccess();
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.message || 'Failed to send invite. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Invite Partner</h2>
            <p className={styles.modalSub}>Search by username to add your savings partner.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        <div className={styles.modalBody}>
          {sent && <div className={styles.successBanner}>Invitation sent to @{found?.username}!</div>}
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>SEARCH BY USERNAME</label>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><Ic.Search /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="e.g. johndoe"
                value={query}
                onChange={handleQueryChange}
                autoFocus
                disabled={sent}
              />
              {searching && <span className={styles.searchSpinner} />}
            </div>
            {searchErr && <span className={styles.hint} style={{ color: '#b91c1c' }}>{searchErr}</span>}
          </div>

          {found && (
            <div className={styles.userFound}>
              <div className={styles.foundAvatar}>{initials(found)}</div>
              <div className={styles.foundInfo}>
                <span className={styles.foundName}>@{found.username}</span>
              </div>
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.ghostBtn} onClick={onClose}>Cancel</button>
            <button
              className={styles.primaryBtn}
              onClick={handleInvite}
              disabled={!found || loading || sent}
            >
              {loading ? 'Sending…' : sent ? 'Sent!' : <><Ic.UserPlus /> Send Invite</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Withdraw Modal
   ══════════════════════════════ */
function WithdrawModal({ plan, onClose, onSuccess }) {
  const [amount,     setAmount]     = useState('');
  const [walletType, setWalletType] = useState('BITCOIN');
  const [address,    setAddress]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [submitted,  setSubmitted]  = useState(false);

  const isMatured = plan.status === 'MATURED';
  const maxAmount = isMatured ? plan.totalPayout : plan.amountSaved;
  const num       = parseFloat(amount) || 0;
  const valid     = num > 0 && num <= maxAmount && address.trim().length > 0;

  async function handleWithdraw(e) {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      await duoSavingsApi.requestWithdrawal(plan.id, {
        amount: num,
        WalletType: walletType,
        walletAddress: address.trim(),
      });
      setSubmitted(true);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Request Withdrawal</h2>
            <p className={styles.modalSub}>
              Available: {fmt(maxAmount)}{isMatured ? ' (matured payout)' : ' (principal)'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        <form onSubmit={handleWithdraw} className={styles.modalBody}>
          <div className={styles.approvalNote}>
            <Ic.Users />
            <span>Both you and your partner must approve before funds are released.</span>
          </div>

          {!isMatured && (
            <div className={styles.warningBox}>
              <Ic.Alert />
              <span>This plan hasn&apos;t matured yet. Early withdrawal may reduce interest earnings.</span>
            </div>
          )}

          {error     && <div className={styles.errorBanner} role="alert">{error}</div>}
          {submitted && (
            <div className={styles.successBanner}>
              Request submitted! Waiting for your partner&apos;s approval.
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
                disabled={submitted}
              />
              <button type="button" className={styles.maxBtn} onClick={() => setAmount(String(maxAmount))} disabled={submitted}>
                MAX
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>WALLET TYPE</label>
            <div className={styles.netToggleRow}>
              <button type="button" className={`${styles.netToggle} ${walletType === 'BITCOIN' ? styles.netToggleActive : ''}`} onClick={() => setWalletType('BITCOIN')} disabled={submitted}>
                <Ic.Bitcoin /> Bitcoin
              </button>
              <button type="button" className={`${styles.netToggle} ${walletType === 'ETHEREUM' ? styles.netToggleActive : ''}`} onClick={() => setWalletType('ETHEREUM')} disabled={submitted}>
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
              disabled={submitted}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.ghostBtn} onClick={onClose}>
              {submitted ? 'Close' : 'Cancel'}
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid || submitted}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Approvals Modal
   ══════════════════════════════ */
function ApprovalsModal({ approvals, onClose, onAction }) {
  const [loadingId, setLoadingId] = useState(null);
  const [done,      setDone]      = useState({});
  const [errors,    setErrors]    = useState({});

  async function handle(id, action) {
    setLoadingId(id);
    setErrors((prev) => ({ ...prev, [id]: '' }));
    try {
      if (action === 'approve') await duoSavingsApi.approveWithdrawal(id);
      else                      await duoSavingsApi.rejectWithdrawal(id);
      setDone((prev) => ({ ...prev, [id]: action }));
      onAction();
    } catch (err) {
      setErrors((prev) => ({ ...prev, [id]: err.message || 'Action failed' }));
    } finally {
      setLoadingId(null);
    }
  }

  const pending = approvals.filter((a) => !done[a.id]);

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 520 }}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Pending Approvals</h2>
            <p className={styles.modalSub}>Withdrawal requests waiting for your signature.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><Ic.Close /></button>
        </div>

        <div className={styles.modalBody}>
          {pending.length === 0 && (
            <div className={styles.emptyApprovals}>All caught up — no pending approvals.</div>
          )}

          {approvals.map((a) => {
            const isDone = done[a.id];
            return (
              <div key={a.id} className={`${styles.approvalItem} ${isDone ? styles.approvalItemDone : ''}`}>
                <div className={styles.approvalRow}>
                  <div className={styles.approvalLeft}>
                    <div className={styles.approvalAvatar}>{initials(a.requestedBy)}</div>
                    <div className={styles.approvalMeta}>
                      <span className={styles.approvalName}>
                        @{a.requestedBy?.username}
                      </span>
                      <span className={styles.approvalSub}>requested a withdrawal</span>
                    </div>
                  </div>
                  <div className={styles.approvalAmount}>{fmt(a.amount)}</div>
                </div>

                <div className={styles.approvalDetail}>
                  <span>{a.WalletType}</span>
                  <span className={styles.approvalAddr}>{truncate(a.walletAddress, 22)}</span>
                </div>

                {errors[a.id] && <div className={styles.errorBanner}>{errors[a.id]}</div>}

                {isDone ? (
                  <div className={`${styles.successBanner}`} style={{ marginTop: 8 }}>
                    {isDone === 'approve' ? 'Approved' : 'Rejected'}
                  </div>
                ) : (
                  <div className={styles.approvalActions}>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handle(a.id, 'reject')}
                      disabled={loadingId === a.id}
                    >
                      Reject
                    </button>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handle(a.id, 'approve')}
                      disabled={loadingId === a.id}
                    >
                      {loadingId === a.id ? 'Processing…' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button className={styles.ghostBtn} style={{ width: '100%' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Plan Card
   ══════════════════════════════ */
function PlanCard({ plan, meId, onDeposit, onInvite, onWithdraw, onRefresh }) {
  const [expanded,     setExpanded]     = useState(false);
  const [history,      setHistory]      = useState(null);
  const [histLoading,  setHistLoading]  = useState(false);
  const [depExpanded,  setDepExpanded]  = useState(false);
  const [deposits,     setDeposits]     = useState(null);
  const [depLoading,   setDepLoading]   = useState(false);
  const [yieldData,    setYieldData]    = useState(null);
  const [yieldChecking, setYieldChecking] = useState(false);
  const [yieldErr,     setYieldErr]     = useState('');

  const isCreator    = plan.createdById === meId;
  const isParticipant = plan.participants.some((p) => p.userId === meId);
  const partnerExists = plan.participants.length >= 2;
  const progress     = maturityProgress(plan.createdAt, plan.maturityDate);
  const readyToMature = plan.status === 'ACTIVE' && new Date() >= new Date(plan.maturityDate);

  const creator = plan.participants.find((p) => p.userId === plan.createdById);
  const partner  = plan.participants.find((p) => p.userId !== plan.createdById);

  async function toggleHistory() {
    if (history !== null) { setExpanded((e) => !e); return; }
    setHistLoading(true);
    setExpanded(true);
    try {
      const res = await duoSavingsApi.getWithdrawalHistory(plan.id);
      setHistory(res.data ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }

  async function toggleDeposits() {
    if (deposits !== null) { setDepExpanded((e) => !e); return; }
    setDepLoading(true);
    setDepExpanded(true);
    try {
      const res = await duoSavingsApi.getDepositHistory(plan.id);
      setDeposits(res.data ?? []);
    } catch {
      setDeposits([]);
    } finally {
      setDepLoading(false);
    }
  }

  async function checkYield() {
    setYieldChecking(true);
    setYieldErr('');
    try {
      const res = await duoSavingsApi.getYield(plan.id);
      setYieldData(res.data);
      onRefresh();
    } catch (err) {
      setYieldErr(err.message || 'Could not check yield');
    } finally {
      setYieldChecking(false);
    }
  }

  return (
    <article className={`${styles.planCard} ${plan.status === 'MATURED' ? styles.planCardMatured : ''} ${plan.status === 'WITHDRAWN' ? styles.planCardWithdrawn : ''}`}>

      {/* Header */}
      <div className={styles.cardHead}>
        <span className={`${styles.statusBadge} ${statusColor(plan.status)}`}>
          {readyToMature && plan.status === 'ACTIVE' ? 'READY TO MATURE' : plan.status}
        </span>
        <span className={styles.rateBadge}>15% MPY</span>
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

      {/* Progress */}
      {plan.status !== 'WITHDRAWN' && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${progress >= 100 ? styles.progressDone : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.dateLabel}><Ic.Clock /> Started {fmtDate(plan.createdAt)}</span>
            <span className={styles.dateLabel}>Matures {fmtDate(plan.maturityDate)}</span>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className={styles.participantsSection}>
        <span className={styles.participantsLabel}>
          PARTICIPANTS ({plan.participants.length}/2)
        </span>
        <div className={styles.participantsList}>
          {/* Creator slot */}
          <div className={styles.participantItem}>
            <div className={styles.avatarWrap}>
              <div className={`${styles.participantAvatar} ${styles.creatorAvatar}`}>
                {creator ? initials(creator.user) : '?'}
              </div>
              <span className={styles.crownBadge}><Ic.Crown /></span>
            </div>
            <span className={styles.participantName}>{creator?.user?.username ? `@${creator.user.username}` : 'Creator'}</span>
            <span className={styles.participantContrib}>{fmt(creator?.contribution)}</span>
          </div>

          <div className={styles.partnerDivider}>+</div>

          {/* Partner slot */}
          {partner ? (
            <div className={styles.participantItem}>
              <div className={styles.avatarWrap}>
                <div className={styles.participantAvatar}>{initials(partner.user)}</div>
              </div>
              <span className={styles.participantName}>{partner.user?.username ? `@${partner.user.username}` : 'Partner'}</span>
              <span className={styles.participantContrib}>{fmt(partner?.contribution)}</span>
            </div>
          ) : (
            <div className={styles.participantItem}>
              <div className={`${styles.participantAvatar} ${styles.emptySlot}`}>
                {isCreator ? (
                  <button className={styles.inviteSlotBtn} onClick={() => onInvite(plan)} title="Invite partner">
                    <Ic.UserPlus />
                  </button>
                ) : '?'}
              </div>
              <span className={styles.participantName} style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {isCreator ? 'Invite partner' : 'Awaiting partner'}
              </span>
              <span className={styles.participantContrib}>—</span>
            </div>
          )}
        </div>
      </div>

      {/* Yield error */}
      {yieldErr && <div className={styles.errorBanner} style={{ marginTop: 0 }}>{yieldErr}</div>}
      {yieldData && (
        <div className={styles.yieldResult}>
          <Ic.TrendUp />
          <span>Current yield — <strong>{fmt(yieldData.totalPayout)}</strong></span>
        </div>
      )}

      {/* Actions */}
      {plan.status !== 'WITHDRAWN' && (
        <div className={styles.cardActions}>
          {plan.status === 'ACTIVE' && isParticipant && (
            <button className={styles.depositBtn} onClick={() => onDeposit(plan)}>
              Deposit
            </button>
          )}
          {plan.status === 'ACTIVE' && (
            <button
              className={`${styles.checkBtn} ${readyToMature ? styles.checkBtnReady : ''}`}
              onClick={checkYield}
              disabled={yieldChecking}
            >
              {yieldChecking ? 'Checking…' : readyToMature ? '✦ Claim Yield' : 'Check Yield'}
            </button>
          )}
          {isParticipant && (
            <button
              className={styles.withdrawBtn}
              onClick={() => onWithdraw(plan)}
              disabled={plan.amountSaved <= 0 && plan.totalPayout <= 0}
            >
              <Ic.Download /> Withdraw
            </button>
          )}
        </div>
      )}

      {plan.status === 'WITHDRAWN' && (
        <div className={styles.withdrawnBadge}>Plan completed and withdrawn</div>
      )}

      {/* Withdrawal history toggle */}
      <button className={styles.historyToggle} onClick={toggleHistory}>
        <Ic.History />
        <span>Withdrawal History</span>
        {expanded ? <Ic.ChevUp /> : <Ic.ChevDown />}
      </button>

      {expanded && (
        <div className={styles.inlineHistory}>
          {histLoading && <div className={styles.histLoadingText}>Loading history…</div>}
          {!histLoading && history?.length === 0 && (
            <div className={styles.histLoadingText}>No withdrawals yet.</div>
          )}
          {!histLoading && history?.map((w) => (
            <div key={w.id} className={styles.inlineHistRow}>
              <div className={styles.inlineHistLeft}>
                <span className={styles.inlineHistUser}>@{w.requestedBy?.username}</span>
                <span className={styles.inlineHistDate}>{fmtDate(w.createdAt)} · {w.WalletType}</span>
                <span className={styles.inlineHistAddr} title={w.walletAddress}>{truncate(w.walletAddress)}</span>
              </div>
              <div className={styles.inlineHistRight}>
                <span className={styles.inlineHistAmount}>{fmt(w.amount)}</span>
                <span className={`${styles.inlineHistStatus} ${w.status === 'EXECUTED' || w.status === 'APPROVED' ? styles.statusDone : w.status === 'REJECTED' ? styles.statusRej : styles.statusPend}`}>
                  {w.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deposit history toggle */}
      <button className={styles.historyToggle} onClick={toggleDeposits}>
        <Ic.History />
        <span>Deposit History</span>
        {depExpanded ? <Ic.ChevUp /> : <Ic.ChevDown />}
      </button>

      {depExpanded && (
        <div className={styles.inlineHistory}>
          {depLoading && <div className={styles.histLoadingText}>Loading history…</div>}
          {!depLoading && deposits?.length === 0 && (
            <div className={styles.histLoadingText}>No deposits yet.</div>
          )}
          {!depLoading && deposits?.map((d) => (
            <div key={d.id} className={styles.inlineHistRow}>
              <div className={styles.inlineHistLeft}>
                <span className={styles.inlineHistUser}>@{d.depositedBy?.username}</span>
                <span className={styles.inlineHistDate}>{fmtDate(d.createdAt)}</span>
              </div>
              <div className={styles.inlineHistRight}>
                <span className={styles.inlineHistAmount}>{fmt(d.amount)}</span>
                <span className={`${styles.inlineHistStatus} ${depositStatusClass(d.status)}`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

/* ══════════════════════════════
   Page
   ══════════════════════════════ */
export default function DuoSavingsPage() {
  const [plans,     setPlans]     = useState([]);
  const [invites,   setInvites]   = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [me,        setMe]        = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const [showCreate,    setShowCreate]    = useState(false);
  const [depositPlan,   setDepositPlan]   = useState(null);
  const [invitePlan,    setInvitePlan]    = useState(null);
  const [withdrawPlan,  setWithdrawPlan]  = useState(null);
  const [showApprovals, setShowApprovals] = useState(false);
  const [acceptingId,   setAcceptingId]   = useState(null);

  const load = useCallback(async () => {
    try {
      const [plansRes, invitesRes, approvalsRes, meRes] = await Promise.all([
        duoSavingsApi.getMyPlans(),
        duoSavingsApi.getInvites(),
        duoSavingsApi.getPendingApprovals(),
        authApi.getMe(),
      ]);
      setPlans(plansRes.data ?? []);
      setInvites(invitesRes.data ?? []);
      setApprovals(approvalsRes.data ?? []);
      setMe(meRes.data?.user ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAcceptInvite(inviteId) {
    setAcceptingId(inviteId);
    try {
      await duoSavingsApi.acceptInvite(inviteId);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to accept invite');
    } finally {
      setAcceptingId(null);
    }
  }

  // Stats
  const activePlans  = plans.filter((p) => p.status !== 'WITHDRAWN');
  const totalSaved   = activePlans.reduce((s, p) => s + (p.amountSaved || 0), 0);
  const totalYield   = activePlans.reduce((s, p) => s + (p.expectedInterest || 0), 0);
  const totalPayout  = activePlans.reduce((s, p) => s + (p.totalPayout || 0), 0);

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/vaults" className={styles.backLink}>
            <Ic.ArrowLeft /> My Vaults
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Duo Vault</h1>
            <span className={styles.mpyBadge}>15% MPY</span>
          </div>
          <p className={styles.pageSub}>Two-person savings with shared 15% compound returns and 2-of-2 withdrawal approval.</p>
        </div>
        <button className={styles.newPlanBtn} onClick={() => setShowCreate(true)}>
          <Ic.Plus /> New Plan
        </button>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className={styles.bannerGroup}>
          {invites.map((inv) => (
            <div key={inv.id} className={styles.inviteBanner}>
              <div className={styles.bannerIcon}><Ic.Bell /></div>
              <div className={styles.bannerText}>
                <strong>@{inv.duoSavings?.createdBy?.username}</strong>
                {' '}invited you to a Duo Vault — {fmt(inv.duoSavings?.amountSaved)} saved · 15% MPY
              </div>
              <button
                className={styles.acceptBtn}
                onClick={() => handleAcceptInvite(inv.id)}
                disabled={acceptingId === inv.id}
              >
                {acceptingId === inv.id ? 'Accepting…' : 'Accept'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pending approvals banner */}
      {approvals.length > 0 && (
        <div className={styles.approvalBanner} onClick={() => setShowApprovals(true)} role="button" tabIndex={0}>
          <div className={styles.bannerIcon} style={{ background: '#fef3c7', color: '#d97706' }}><Ic.Alert /></div>
          <div className={styles.bannerText}>
            <strong>{approvals.length} withdrawal request{approvals.length > 1 ? 's' : ''}</strong> awaiting your approval.
          </div>
          <button className={styles.reviewBtn}>Review →</button>
        </div>
      )}

      {/* Stats row */}
      {!loading && plans.length > 0 && (
        <div className={styles.statsRow}>
          {[
            { label: 'Total Deposited', value: fmt(totalSaved),  Icon: Ic.Wallet },
            { label: 'Yield Earned',    value: fmt(totalYield),  Icon: Ic.TrendUp },
            { label: 'Total Value',     value: fmt(totalPayout), Icon: Ic.Zap },
            { label: 'Active Plans',    value: `${activePlans.filter(p => p.status === 'ACTIVE').length} active · ${activePlans.filter(p => p.status === 'MATURED').length} matured`, Icon: Ic.Users },
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

      {/* Plans */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2].map((i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.Users /></div>
          <h2 className={styles.emptyTitle}>No Duo Vaults yet</h2>
          <p className={styles.emptySub}>Create a Duo Vault and invite a partner to start earning 15% compound returns together.</p>
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
              meId={me?.id}
              onDeposit={setDepositPlan}
              onInvite={setInvitePlan}
              onWithdraw={setWithdrawPlan}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
      {depositPlan && (
        <DepositModal plan={depositPlan} onClose={() => setDepositPlan(null)} onSuccess={load} />
      )}
      {invitePlan && (
        <InviteModal plan={invitePlan} onClose={() => setInvitePlan(null)} onSuccess={load} />
      )}
      {withdrawPlan && (
        <WithdrawModal plan={withdrawPlan} onClose={() => setWithdrawPlan(null)} onSuccess={load} />
      )}
      {showApprovals && (
        <ApprovalsModal approvals={approvals} onClose={() => setShowApprovals(false)} onAction={load} />
      )}
    </div>
  );
}
