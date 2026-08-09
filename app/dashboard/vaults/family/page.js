'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { familySavingsApi, authApi } from '@/lib/api';
import styles from './page.module.css';

/* ══════════════════════════════
   Icons
   ══════════════════════════════ */
const Ic = {
  ArrowLeft:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Close:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Copy:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Users:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  UserPlus:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Deposit:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Withdraw:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  Clock:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Alert:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Bell:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Crown:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 20h20v2H2v-2zM3.19 9l2.81 3 4-8 4 8 2.81-3L20 18H4z"/></svg>,
  TrendUp:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  History:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Search:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bitcoin:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.5 13.5H9v-3h4.5a1.5 1.5 0 0 1 0 3zM9 12V9h4a1.5 1.5 0 0 1 0 3z"/></svg>,
  Ethereum:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 12 12 22 22 12"/></svg>,
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
function initials(user) {
  if (!user) return '?';
  return ((user.firstname?.[0] ?? '') + (user.lastname?.[0] ?? '')).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
}
function maturityProgress(startDate, maturityDate) {
  const now = Date.now(), start = new Date(startDate).getTime(), end = new Date(maturityDate).getTime();
  if (now >= end) return 100;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}
function isReadyToMature(plan) {
  return plan.status === 'ACTIVE' && new Date() >= new Date(plan.maturityDate);
}
function daysUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Matured';
  const days = Math.ceil(diff / 86400000);
  return `${days}d remaining`;
}
function statusColor(status) {
  if (status === 'ACTIVE')    return styles.statusActive;
  if (status === 'MATURED')   return styles.statusMatured;
  if (status === 'WITHDRAWN') return styles.statusWithdrawn;
  return styles.statusActive;
}
function withdrawalStatusColor(status) {
  if (status === 'PENDING')  return styles.wStatusPending;
  if (status === 'APPROVED' || status === 'EXECUTED') return styles.wStatusApproved;
  if (status === 'REJECTED') return styles.wStatusRejected;
  return styles.wStatusPending;
}

/* ══════════════════════════════
   Copy button
   ══════════════════════════════ */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button className={styles.copyBtn} onClick={handle}>
      {copied ? <Ic.Check /> : <Ic.Copy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ══════════════════════════════
   Payment step (reusable)
   ══════════════════════════════ */
function PaymentStep({ amount, onDone, label = 'Done — I\'ve Made Payment' }) {
  const [net, setNet] = useState('bitcoin');
  const btc = { network: 'Bitcoin',   address: 'bc1qs9q7ynsldjwn62rtjha3q29v54ewqef08fxrdp', amountToPay: amount };
  const eth = { network: 'Ethereum',  address: '0xFCa95a8187e9BEd54df102C111CedaF93f596F2D', amountToPay: amount };
  const info = net === 'bitcoin' ? btc : eth;

  return (
    <div className={styles.modalBody}>
      <div className={styles.netToggleRow}>
        <button className={`${styles.netToggle} ${net === 'bitcoin'  ? styles.netToggleActive : ''}`} onClick={() => setNet('bitcoin')}><Ic.Bitcoin /> Bitcoin</button>
        <button className={`${styles.netToggle} ${net === 'ethereum' ? styles.netToggleActive : ''}`} onClick={() => setNet('ethereum')}><Ic.Ethereum /> Ethereum</button>
      </div>
      <div className={styles.addressCard}>
        <div className={styles.addressLabel}>
          <span className={styles.networkBadge}>{info.network}</span>
          <span className={styles.addressMeta}>Send exactly {fmt(info.amountToPay)}</span>
        </div>
        <div className={styles.addressRow}>
          <code className={styles.addressCode}>{info.address}</code>
          <CopyBtn text={info.address} />
        </div>
      </div>
      <div className={styles.warningBox}><Ic.Alert /><span>Send the exact amount shown. Sending a different amount may result in an unconfirmed plan.</span></div>
      <button className={styles.primaryBtn} onClick={onDone}>{label}</button>
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

  const num      = parseFloat(amount) || 0;
  const interest = +(num * 0.30).toFixed(2);
  const payout   = +(num + interest).toFixed(2);
  const valid    = num >= 1000;

  async function handleCreate(e) {
    e.preventDefault();
    if (!valid) { setError('Minimum savings amount is $1,000'); return; }
    setError(''); setLoading(true);
    try {
      await familySavingsApi.create({ amount: num });
      onCreated();
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to create plan.');
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{step === 1 ? 'Create Family Vault' : 'Make Payment'}</h2>
            <p className={styles.modalSub}>{step === 1 ? 'Minimum $1,000 · 30% MPY · 21-day maturity' : `Send exactly ${fmt(num)} to activate your plan`}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><Ic.Close /></button>
        </div>

        <div className={styles.stepRow}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDone : ''}`}>1</div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDone : ''}`}>2</div>
        </div>

        {step === 1 && (
          <form onSubmit={handleCreate} className={styles.modalBody}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.field}>
              <label className={styles.label}>SAVINGS AMOUNT</label>
              <div className={styles.amountInputWrap}>
                <span className={styles.currencyPrefix}>$</span>
                <input type="number" min="1000" step="0.01" className={styles.amountInput} placeholder="0.00" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} autoFocus />
              </div>
              <span className={styles.hint}>Minimum deposit: $1,000.00</span>
            </div>
            {valid && (
              <div className={styles.previewCard}>
                <h3 className={styles.previewTitle}>Earnings Preview</h3>
                <div className={styles.previewRows}>
                  <div className={styles.previewRow}><span>Principal</span><span>{fmt(num)}</span></div>
                  <div className={styles.previewRow}><span className={styles.previewGreen}>30% Interest (MPY)</span><span className={styles.previewGreen}>+ {fmt(interest)}</span></div>
                  <div className={styles.previewDivider} />
                  <div className={`${styles.previewRow} ${styles.previewTotal}`}><span>Total Payout</span><span>{fmt(payout)}</span></div>
                </div>
                <div className={styles.previewMeta}>Matures in 21 days · Members can top-up anytime</div>
              </div>
            )}
            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid}>
              {loading ? 'Creating…' : 'Create Family Vault →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <PaymentStep amount={num} onDone={onClose} />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Invite Modal
   ══════════════════════════════ */
function InviteModal({ plan, onClose, onSuccess }) {
  const [query,    setQuery]    = useState('');
  const [found,    setFound]    = useState(null);
  const [searching,setSearching]= useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const debounce = useRef(null);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val); setFound(null); setError('');
    clearTimeout(debounce.current);
    if (val.trim().length < 3) return;
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await authApi.findUser(val.trim());
        setFound(res.data.user);
      } catch {
        setFound(null);
      } finally { setSearching(false); }
    }, 500);
  }

  async function handleInvite() {
    if (!found) return;
    setError(''); setLoading(true);
    try {
      await familySavingsApi.invite(plan.id, { invitedUserId: found.id });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to send invitation.');
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Invite a Member</h2>
            <p className={styles.modalSub}>Search by username to add someone to this vault</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><Ic.Close /></button>
        </div>
        <div className={styles.modalBody}>
          {error   && <div className={styles.errorBanner}>{error}</div>}
          {success && <div className={styles.successBanner}>Invitation sent successfully!</div>}

          <div className={styles.field}>
            <label className={styles.label}>SEARCH BY USERNAME</label>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><Ic.Search /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="e.g. johndoe123"
                value={query}
                onChange={handleQueryChange}
                autoFocus
              />
              {searching && <span className={styles.searchSpinner} />}
            </div>
            <span className={styles.hint}>Type at least 3 characters to search</span>
          </div>

          {/* Search result */}
          {found && (
            <div className={styles.foundUser}>
              <div className={styles.foundAvatar}>{initials(found)}</div>
              <div className={styles.foundInfo}>
                <span className={styles.foundName}>{found.firstname} {found.lastname}</span>
                <span className={styles.foundUsername}>@{found.username}</span>
              </div>
              <button className={styles.inviteUserBtn} onClick={handleInvite} disabled={loading || success}>
                {loading ? '…' : 'Invite'}
              </button>
            </div>
          )}

          {query.length >= 3 && !found && !searching && (
            <div className={styles.notFound}>No user found with username &quot;{query}&quot;</div>
          )}

          <div className={styles.modalFooter}>
            <button className={styles.ghostBtn} onClick={onClose}>Cancel</button>
          </div>
        </div>
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

  const num   = parseFloat(amount) || 0;
  const valid = num > 0;

  async function handleDeposit(e) {
    e.preventDefault();
    if (!valid) return;
    setError(''); setLoading(true);
    try {
      await familySavingsApi.deposit(plan.id, { amount: num });
      onSuccess();
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to deposit.');
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{step === 1 ? 'Top-Up Vault' : 'Make Payment'}</h2>
            <p className={styles.modalSub}>{step === 1 ? `Add funds to your Family Vault · Current: ${fmt(plan.amountSaved)}` : `Send exactly ${fmt(num)} to complete deposit`}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><Ic.Close /></button>
        </div>

        {step === 1 && (
          <form onSubmit={handleDeposit} className={styles.modalBody}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.field}>
              <label className={styles.label}>DEPOSIT AMOUNT</label>
              <div className={styles.amountInputWrap}>
                <span className={styles.currencyPrefix}>$</span>
                <input type="number" min="1" step="0.01" className={styles.amountInput} placeholder="0.00" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} autoFocus />
              </div>
            </div>
            {valid && (
              <div className={styles.previewCard}>
                <div className={styles.previewRows}>
                  <div className={styles.previewRow}><span>Current Balance</span><span>{fmt(plan.amountSaved)}</span></div>
                  <div className={styles.previewRow}><span className={styles.previewGreen}>+ Top-Up</span><span className={styles.previewGreen}>+ {fmt(num)}</span></div>
                  <div className={styles.previewDivider} />
                  <div className={`${styles.previewRow} ${styles.previewTotal}`}><span>New Total</span><span>{fmt(plan.amountSaved + num)}</span></div>
                  <div className={styles.previewRow}><span className={styles.previewGreen}>New 30% Yield</span><span className={styles.previewGreen}>{fmt((plan.amountSaved + num) * 0.30)}</span></div>
                </div>
              </div>
            )}
            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid}>
              {loading ? 'Processing…' : 'Confirm Deposit →'}
            </button>
          </form>
        )}

        {step === 2 && <PaymentStep amount={num} onDone={onClose} label="Done — Deposit Submitted" />}
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
  const [success,    setSuccess]    = useState(false);

  const isMatured = plan.status === 'MATURED';
  const maxAmount = isMatured ? plan.totalPayout : plan.amountSaved;
  const num       = parseFloat(amount) || 0;
  const valid     = num > 0 && num <= maxAmount && address.trim().length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setError(''); setLoading(true);
    try {
      await familySavingsApi.requestWithdrawal(plan.id, { amount: num, WalletType: walletType, walletAddress: address.trim() });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message || 'Withdrawal request failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Request Withdrawal</h2>
            <p className={styles.modalSub}>Available: {fmt(maxAmount)} · Requires member approval</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><Ic.Close /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.approvalNotice}>
            <Ic.Users />
            <span>Family withdrawals require approval from all other members before funds are released.</span>
          </div>
          {!isMatured && (
            <div className={styles.warningBox}><Ic.Alert /><span>This plan hasn&apos;t matured yet. Early withdrawal reduces interest on the withdrawn amount.</span></div>
          )}
          {error   && <div className={styles.errorBanner}>{error}</div>}
          {success && <div className={styles.successBanner}>Withdrawal request submitted! Waiting for member approvals.</div>}

          <div className={styles.field}>
            <label className={styles.label}>AMOUNT</label>
            <div className={styles.amountInputWrap}>
              <span className={styles.currencyPrefix}>$</span>
              <input type="number" min="1" step="0.01" max={maxAmount} className={styles.amountInput} placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <button type="button" className={styles.maxBtn} onClick={() => setAmount(String(maxAmount))}>MAX</button>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>WALLET TYPE</label>
            <div className={styles.netToggleRow}>
              <button type="button" className={`${styles.netToggle} ${walletType === 'BITCOIN'   ? styles.netToggleActive : ''}`} onClick={() => setWalletType('BITCOIN')}><Ic.Bitcoin /> Bitcoin</button>
              <button type="button" className={`${styles.netToggle} ${walletType === 'ETHEREUM'  ? styles.netToggleActive : ''}`} onClick={() => setWalletType('ETHEREUM')}><Ic.Ethereum /> Ethereum</button>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>YOUR WALLET ADDRESS</label>
            <input type="text" className={styles.textInput} placeholder={walletType === 'BITCOIN' ? 'bc1q…' : '0x…'} value={address} onChange={(e) => setAddress(e.target.value)} spellCheck={false} />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.ghostBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryBtn} disabled={loading || !valid || success}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Pending Approvals Modal
   ══════════════════════════════ */
function ApprovalsModal({ requests, onClose, onAction }) {
  const [busy, setBusy] = useState({});
  const [done, setDone] = useState({});

  async function handle(requestId, action) {
    setBusy((p) => ({ ...p, [requestId]: true }));
    try {
      if (action === 'approve') await familySavingsApi.approveWithdrawal(requestId);
      else                      await familySavingsApi.rejectWithdrawal(requestId);
      setDone((p) => ({ ...p, [requestId]: action }));
      onAction();
    } catch { /* show nothing */ }
    finally { setBusy((p) => ({ ...p, [requestId]: false })); }
  }

  return (
    <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 540 }}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Pending Approvals</h2>
            <p className={styles.modalSub}>{requests.length} withdrawal request{requests.length !== 1 ? 's' : ''} awaiting your review</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><Ic.Close /></button>
        </div>
        <div className={styles.modalBody}>
          {requests.map((req) => (
            <div key={req.id} className={styles.approvalCard}>
              <div className={styles.approvalTop}>
                <div className={styles.approvalAvatar}>{initials(req.requestedBy)}</div>
                <div className={styles.approvalInfo}>
                  <span className={styles.approvalName}>{req.requestedBy?.firstname} {req.requestedBy?.lastname}</span>
                  <span className={styles.approvalMeta}>Requested {fmtDateTime(req.createdAt)}</span>
                </div>
                <span className={styles.approvalAmount}>{fmt(req.amount)}</span>
              </div>
              <div className={styles.approvalDetail}>
                <span>{req.WalletType ?? '—'}</span>
                <span className={styles.approvalAddr} title={req.walletAddress}>{req.walletAddress ? `${req.walletAddress.slice(0,10)}…` : '—'}</span>
              </div>
              {done[req.id] ? (
                <div className={`${styles.successBanner}`} style={{ marginTop: 8 }}>
                  {done[req.id] === 'approve' ? '✓ Approved' : '✗ Rejected'}
                </div>
              ) : (
                <div className={styles.approvalBtns}>
                  <button className={styles.rejectBtn}  onClick={() => handle(req.id, 'reject')}  disabled={busy[req.id]}>Reject</button>
                  <button className={styles.approveBtn} onClick={() => handle(req.id, 'approve')} disabled={busy[req.id]}>{busy[req.id] ? '…' : 'Approve'}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Plan Card
   ══════════════════════════════ */
function PlanCard({ plan, currentUserId, onDeposit, onWithdraw, onInvite, onRefresh }) {
  const [yieldData,  setYieldData]  = useState(null);
  const [checking,   setChecking]   = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [history,    setHistory]    = useState(null);
  const [loadingHist,setLoadingHist]= useState(false);

  const progress = maturityProgress(plan.startDate, plan.maturityDate);
  const ready    = isReadyToMature(plan);
  const isCreator = plan.createdById === currentUserId || plan.isCreator;

  async function checkYield() {
    setChecking(true);
    try {
      const res = await familySavingsApi.getYield(plan.id);
      setYieldData(res.data);
      onRefresh();
    } catch { /* noop */ }
    finally { setChecking(false); }
  }

  async function loadHistory() {
    if (history) { setExpanded((v) => !v); return; }
    setLoadingHist(true); setExpanded(true);
    try {
      const res = await familySavingsApi.getWithdrawalHistory(plan.id);
      setHistory(res.data ?? []);
    } catch { setHistory([]); }
    finally { setLoadingHist(false); }
  }

  return (
    <article className={`${styles.planCard} ${plan.status === 'MATURED' ? styles.planCardMatured : ''} ${plan.status === 'WITHDRAWN' ? styles.planCardWithdrawn : ''}`}>

      {/* Header row */}
      <div className={styles.cardHead}>
        <span className={`${styles.statusBadge} ${statusColor(ready && plan.status === 'ACTIVE' ? 'ACTIVE' : plan.status)}`}>
          {ready && plan.status === 'ACTIVE' ? 'READY TO MATURE' : plan.status}
        </span>
        <span className={styles.rateBadge}>30% MPY</span>
      </div>

      {/* Main amount */}
      <div className={styles.amountBlock}>
        <div className={styles.principalAmount}>{fmt(plan.amountSaved)}</div>
        <div className={styles.amountLabel}>Total Saved</div>
      </div>

      {/* Yield row */}
      <div className={styles.yieldRow}>
        <div className={styles.yieldItem}>
          <span className={styles.yieldItemLabel}>Interest Earned</span>
          <span className={styles.yieldItemValue} style={{ color: '#16a34a' }}>+ {fmt(plan.expectedInterest)}</span>
        </div>
        <div className={styles.yieldSep} />
        <div className={styles.yieldItem}>
          <span className={styles.yieldItemLabel}>Total Payout</span>
          <span className={styles.yieldItemValue}>{fmt(plan.totalPayout)}</span>
        </div>
      </div>

      {/* Participants */}
      <div className={styles.participantsRow}>
        <div className={styles.avatarStack}>
          {plan.participants?.slice(0, 5).map((p, i) => (
            <div
              key={p.id}
              className={`${styles.participantAvatar} ${p.userId === currentUserId ? styles.participantAvatarSelf : ''}`}
              style={{ zIndex: 10 - i }}
              title={`${p.user?.firstname} ${p.user?.lastname}${p.userId === plan.createdById ? ' (creator)' : ''}`}
            >
              {p.userId === plan.createdById && <span className={styles.crownIcon}><Ic.Crown /></span>}
              {initials(p.user)}
            </div>
          ))}
          {(plan.participants?.length ?? 0) > 5 && (
            <div className={`${styles.participantAvatar} ${styles.participantMore}`}>+{plan.participants.length - 5}</div>
          )}
        </div>
        <span className={styles.participantCount}>{plan.participants?.length ?? 0} member{plan.participants?.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Each member's contribution */}
      <div className={styles.contributionList}>
        {plan.participants?.map((p) => (
          <div key={p.id} className={styles.contributionRow}>
            <span className={styles.contributionName}>
              {p.user?.firstname} {p.user?.lastname}
              {p.userId === plan.createdById && <span className={styles.creatorTag}>Creator</span>}
              {p.userId === currentUserId    && <span className={styles.youTag}>You</span>}
            </span>
            <span className={styles.contributionAmount}>{fmt(p.contribution)}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      {plan.status !== 'WITHDRAWN' && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${progress >= 100 ? styles.progressDone : ''}`} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.dateLabel}><Ic.Clock /> {fmtDate(plan.startDate)}</span>
            <span className={styles.dateLabel}>{ready ? 'Matured' : daysUntil(plan.maturityDate)}</span>
          </div>
        </div>
      )}

      {/* Yield result */}
      {yieldData && (
        <div className={styles.yieldResult}>
          <Ic.TrendUp />
          <span>Status: <strong>{yieldData.status}</strong> · Payout: <strong>{fmt(yieldData.totalPayout)}</strong></span>
        </div>
      )}

      {/* Actions */}
      {plan.status !== 'WITHDRAWN' && (
        <div className={styles.cardActions}>
          {plan.status === 'ACTIVE' && (
            <button className={`${styles.actionBtn} ${styles.depositBtn}`} onClick={() => onDeposit(plan)}>
              <Ic.Deposit /> Deposit
            </button>
          )}
          {plan.status === 'ACTIVE' && (
            <button className={`${styles.actionBtn} ${ready ? styles.checkBtnReady : styles.checkBtn}`} onClick={checkYield} disabled={checking}>
              {checking ? '…' : ready ? '✦ Claim Yield' : 'Check Yield'}
            </button>
          )}
          <button className={`${styles.actionBtn} ${styles.withdrawBtn}`} onClick={() => onWithdraw(plan)}>
            <Ic.Withdraw /> Withdraw
          </button>
        </div>
      )}

      {/* Secondary: Invite + History */}
      <div className={styles.cardSecondary}>
        {isCreator && plan.status === 'ACTIVE' && (
          <button className={styles.secondaryBtn} onClick={() => onInvite(plan)}>
            <Ic.UserPlus /> Invite Member
          </button>
        )}
        <button className={styles.secondaryBtn} onClick={loadHistory}>
          <Ic.History /> {expanded ? 'Hide History' : 'Withdrawal History'}
        </button>
      </div>

      {/* Withdrawal history (expanded) */}
      {expanded && (
        <div className={styles.historyExpand}>
          {loadingHist && <div className={styles.historyLoading}>Loading…</div>}
          {history && history.length === 0 && <div className={styles.historyEmpty}>No withdrawals yet for this plan.</div>}
          {history && history.length > 0 && history.map((w) => (
            <div key={w.id} className={styles.historyItem}>
              <div className={styles.historyItemLeft}>
                <div className={styles.historyItemAvatar}>{initials(w.requestedBy)}</div>
                <div>
                  <span className={styles.historyItemName}>{w.requestedBy?.firstname} {w.requestedBy?.lastname}</span>
                  <span className={styles.historyItemDate}>{fmtDateTime(w.createdAt)}</span>
                </div>
              </div>
              <div className={styles.historyItemRight}>
                <span className={styles.historyItemAmount}>{fmt(w.amount)}</span>
                <span className={`${styles.historyItemStatus} ${withdrawalStatusColor(w.status)}`}>{w.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.status === 'WITHDRAWN' && (
        <div className={styles.withdrawnBadge}>Plan fully withdrawn and closed</div>
      )}
    </article>
  );
}

/* ══════════════════════════════
   Page
   ══════════════════════════════ */
export default function FamilySavingsPage() {
  const [plans,       setPlans]       = useState([]);
  const [invites,     setInvites]     = useState([]);
  const [approvals,   setApprovals]   = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  const [showCreate,   setShowCreate]   = useState(false);
  const [depositPlan,  setDepositPlan]  = useState(null);
  const [withdrawPlan, setWithdrawPlan] = useState(null);
  const [invitePlan,   setInvitePlan]   = useState(null);
  const [showApprovals,setShowApprovals]= useState(false);

  const load = useCallback(async () => {
    try {
      const [plansRes, invitesRes, approvalsRes, meRes] = await Promise.all([
        familySavingsApi.getMyPlans(),
        familySavingsApi.getInvites(),
        familySavingsApi.getPendingApprovals(),
        authApi.getMe(),
      ]);
      setPlans(plansRes.data ?? []);
      setInvites(invitesRes.data ?? []);
      setApprovals(approvalsRes.data ?? []);
      setCurrentUser(meRes.data?.user ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function acceptInvite(inviteId) {
    try {
      await familySavingsApi.acceptInvite(inviteId);
      load();
    } catch (err) {
      setError(err.message || 'Failed to accept invite.');
    }
  }

  // Summary stats
  const activePlans  = plans.filter((p) => p.status === 'ACTIVE');
  const totalSaved   = plans.reduce((s, p) => s + (p.amountSaved || 0), 0);
  const totalYield   = plans.reduce((s, p) => s + (p.expectedInterest || 0), 0);
  const totalPayout  = plans.reduce((s, p) => s + (p.totalPayout || 0), 0);

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/vaults" className={styles.backLink}><Ic.ArrowLeft /> My Vaults</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Family Vault</h1>
            <span className={styles.mpyBadge}>30% MPY</span>
          </div>
          <p className={styles.pageSub}>High-yield group savings with shared goals and multi-party withdrawal approval.</p>
        </div>
        <button className={styles.newPlanBtn} onClick={() => setShowCreate(true)}><Ic.Plus /> New Vault</button>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {/* Notification banners */}
      {invites.length > 0 && (
        <div className={styles.notifBanner}>
          <div className={styles.notifLeft}><Ic.Bell /><span><strong>{invites.length}</strong> pending vault invitation{invites.length !== 1 ? 's' : ''}</span></div>
          <div className={styles.inviteList}>
            {invites.map((inv) => (
              <div key={inv.id} className={styles.inviteCard}>
                <div className={styles.inviteInfo}>
                  <span className={styles.inviteFrom}>from <strong>{inv.familySavings?.createdBy?.firstname} {inv.familySavings?.createdBy?.lastname}</strong></span>
                  <span className={styles.inviteMeta}>{fmt(inv.familySavings?.amountSaved)} · 30% MPY · Matures {fmtDate(inv.familySavings?.maturityDate)}</span>
                </div>
                <button className={styles.acceptBtn} onClick={() => acceptInvite(inv.id)}>Accept</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvals.length > 0 && (
        <div className={styles.approvalBanner}>
          <div className={styles.notifLeft}><Ic.Alert /><span><strong>{approvals.length}</strong> withdrawal request{approvals.length !== 1 ? 's' : ''} need your approval</span></div>
          <button className={styles.reviewBtn} onClick={() => setShowApprovals(true)}>Review Now</button>
        </div>
      )}

      {/* Stats row */}
      {!loading && plans.length > 0 && (
        <div className={styles.statsRow}>
          {[
            { label: 'Total Saved',    value: fmt(totalSaved)  },
            { label: 'Total Yield',    value: fmt(totalYield)  },
            { label: 'Total Payout',   value: fmt(totalPayout) },
            { label: 'Active Vaults',  value: `${activePlans.length}` },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Plans */}
      {loading ? (
        <div className={styles.skeletonGrid}>{[1,2,3].map((i) => <div key={i} className={styles.skeletonCard} />)}</div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.Users /></div>
          <h2 className={styles.emptyTitle}>No family vaults yet</h2>
          <p className={styles.emptySub}>Create a Family Vault to start earning 30% compound interest with shared members. Invite up to 5 people to join.</p>
          <button className={styles.newPlanBtn} onClick={() => setShowCreate(true)}><Ic.Plus /> Create First Vault</button>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentUserId={currentUser?.id}
              onDeposit={setDepositPlan}
              onWithdraw={setWithdrawPlan}
              onInvite={setInvitePlan}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate   && <CreateModal  onClose={() => setShowCreate(false)}   onCreated={load} />}
      {depositPlan  && <DepositModal plan={depositPlan}  onClose={() => setDepositPlan(null)}  onSuccess={load} />}
      {withdrawPlan && <WithdrawModal plan={withdrawPlan} onClose={() => setWithdrawPlan(null)} onSuccess={load} />}
      {invitePlan   && <InviteModal   plan={invitePlan}   onClose={() => setInvitePlan(null)}   onSuccess={load} />}
      {showApprovals && <ApprovalsModal requests={approvals} onClose={() => setShowApprovals(false)} onAction={load} />}
    </div>
  );
}
