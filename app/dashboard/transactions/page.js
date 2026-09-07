'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

const Ic = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Plus:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ArrowDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Vault:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  List:      () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
};

function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function truncate(str, len = 18) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, 8) + '…' + str.slice(-6);
}
function statusClass(status) {
  if (status === 'PENDING') return styles.statusPending;
  if (status === 'REJECTED') return styles.statusRejected;
  if (status === 'WITHDRAWN') return styles.statusWithdrawn;
  if (status === 'MATURED') return styles.statusMatured;
  return styles.statusDone; // ACTIVE, APPROVED, ACCEPTED, EXECUTED, SUCCESSFUL
}
function eventLabel(row) {
  const vault = row.vaultType === 'SINGLE' ? 'Single' : row.vaultType === 'DUO' ? 'Duo' : 'Family';
  if (row.eventType === 'PLAN_CREATED') return `${vault} Vault Created`;
  if (row.eventType === 'DEPOSIT') return `${vault} Deposit${row.byUsername ? ` by @${row.byUsername}` : ''}`;
  return `${vault} Withdrawal${row.byUsername ? ` by @${row.byUsername}` : ''}`;
}

const TYPE_CHIPS = [
  { key: 'ALL', label: 'All' },
  { key: 'PLAN_CREATED', label: 'Plan Created' },
  { key: 'DEPOSIT', label: 'Deposits' },
  { key: 'WITHDRAWAL', label: 'Withdrawals' },
];
const VAULT_CHIPS = [
  { key: 'ALL', label: 'All Vaults' },
  { key: 'SINGLE', label: 'Single' },
  { key: 'DUO', label: 'Duo' },
  { key: 'FAMILY', label: 'Family' },
];

export default function TransactionsPage() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [typeFilter,  setTypeFilter]  = useState('ALL');
  const [vaultFilter, setVaultFilter] = useState('ALL');

  useEffect(() => {
    authApi.getMyTransactions()
      .then((res) => setRows(res.data ?? []))
      .catch((err) => setError(err.message || 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((r) =>
    (typeFilter === 'ALL' || r.eventType === typeFilter) &&
    (vaultFilter === 'ALL' || r.vaultType === vaultFilter)
  ), [rows, typeFilter, vaultFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}><Ic.ArrowLeft /> Back to Dashboard</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Transactions</h1>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.pickerGrid}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard} style={{ height: 70 }} />)}
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.List /></div>
          <h3 className={styles.emptyTitle}>No transactions yet</h3>
          <p className={styles.hint}>Once you create a vault or make a deposit, it&apos;ll show up here.</p>
        </div>
      ) : (
        <div className={styles.sectionCard}>
          <div className={styles.chipRow}>
            {TYPE_CHIPS.map((c) => (
              <button key={c.key} type="button" className={`${styles.chip} ${typeFilter === c.key ? styles.chipActive : ''}`} onClick={() => setTypeFilter(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.chipRow}>
            {VAULT_CHIPS.map((c) => (
              <button key={c.key} type="button" className={`${styles.chip} ${vaultFilter === c.key ? styles.chipActive : ''}`} onClick={() => setVaultFilter(c.key)}>
                {c.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className={styles.hint}>No transactions match this filter.</p>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className={styles.txRow}>
                <div className={styles.txLeft}>
                  <span className={`${styles.txIcon} ${r.eventType === 'DEPOSIT' ? styles.txIconDeposit : r.eventType === 'WITHDRAWAL' ? styles.txIconWithdraw : styles.txIconPlan}`}>
                    {r.eventType === 'WITHDRAWAL' ? <Ic.ArrowDown /> : r.eventType === 'DEPOSIT' ? <Ic.Plus /> : <Ic.Vault />}
                  </span>
                  <div>
                    <div className={styles.txName}>{eventLabel(r)}</div>
                    <div className={styles.txMeta}>
                      {fmtDateTime(r.date)}
                      {r.walletAddress && ` · ${truncate(r.walletAddress)}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`${styles.statusBadge} ${statusClass(r.status)}`}>{r.status}</span>
                  <span className={styles.txAmount}>{fmt(r.amount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
