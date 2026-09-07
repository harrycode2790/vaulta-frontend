'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { singleSavingsApi, duoSavingsApi, familySavingsApi } from '@/lib/api';
import styles from './page.module.css';

const Ic = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Chart:     () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
};

function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function maturityProgress(created, maturity) {
  const now   = Date.now();
  const start = new Date(created).getTime();
  const end   = new Date(maturity).getTime();
  if (now >= end) return 100;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}

const VAULT_COLORS = { SINGLE: '#0369a1', DUO: '#16a34a', FAMILY: '#d97706' };
const VAULT_LABEL  = { SINGLE: 'Single', DUO: 'Duo', FAMILY: 'Family' };

export default function AnalyticsPage() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [singleRes, duoRes, familyRes] = await Promise.all([
        singleSavingsApi.getHistory(),
        duoSavingsApi.getMyPlans(),
        familySavingsApi.getMyPlans(),
      ]);
      const all = [
        ...(singleRes.data ?? []).map((p) => ({ ...p, vaultType: 'SINGLE' })),
        ...(duoRes.data ?? []).map((p) => ({ ...p, vaultType: 'DUO' })),
        ...(familyRes.data ?? []).map((p) => ({ ...p, vaultType: 'FAMILY' })),
      ].filter((p) => p.status === 'ACTIVE' || p.status === 'MATURED');
      setPlans(all);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalSaved  = plans.reduce((s, p) => s + (p.amountSaved || 0), 0);
  const totalYield  = plans.reduce((s, p) => s + (p.expectedInterest || 0), 0);
  const totalPayout = plans.reduce((s, p) => s + (p.totalPayout || 0), 0);

  const byVault = ['SINGLE', 'DUO', 'FAMILY'].map((v) => ({
    vaultType: v,
    amount: plans.filter((p) => p.vaultType === v).reduce((s, p) => s + (p.amountSaved || 0), 0),
  })).filter((v) => v.amount > 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}><Ic.ArrowLeft /> Back to Dashboard</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Analytics</h1>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.pickerGrid}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonCard} style={{ height: 100 }} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Ic.Chart /></div>
          <h3 className={styles.emptyTitle}>Nothing to analyze yet</h3>
          <p className={styles.hint}>Create a savings plan to start tracking your growth here.</p>
          <Link href="/dashboard/vaults" className={styles.primaryBtn}>Create a Vault</Link>
        </div>
      ) : (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Saved</span>
              <span className={styles.statValue}>{fmt(totalSaved)}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Expected Yield</span>
              <span className={styles.statValue}>{fmt(totalYield)}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Projected Payout</span>
              <span className={styles.statValue}>{fmt(totalPayout)}</span>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Portfolio Composition</h2>
            <div className={styles.compBar}>
              {byVault.map((v) => (
                <div
                  key={v.vaultType}
                  className={styles.compSegment}
                  style={{ width: `${(v.amount / totalSaved) * 100}%`, background: VAULT_COLORS[v.vaultType] }}
                />
              ))}
            </div>
            <div className={styles.compLegend}>
              {byVault.map((v) => (
                <div key={v.vaultType} className={styles.compLegendItem}>
                  <span className={styles.compDot} style={{ background: VAULT_COLORS[v.vaultType] }} />
                  {VAULT_LABEL[v.vaultType]} · {fmt(v.amount)} ({((v.amount / totalSaved) * 100).toFixed(0)}%)
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Maturity Progress</h2>
            <div className={styles.pickerGrid}>
              {plans.map((p) => {
                const progress = maturityProgress(p.startDate ?? p.createdAt, p.maturityDate);
                return (
                  <div key={`${p.vaultType}-${p.id}`} className={styles.pickerCard} style={{ cursor: 'default' }}>
                    <div className={styles.pickerCardHead}>
                      <span className={styles.pickerCardBadge}>{VAULT_LABEL[p.vaultType]} Vault</span>
                      <span className={styles.pickerCardMeta}>{p.status}</span>
                    </div>
                    <span className={styles.pickerCardAmount}>{fmt(p.amountSaved)}</span>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.pickerCardMeta}>
                      {progress >= 100 ? 'Matured' : `${progress.toFixed(0)}% to maturity · ${fmtDate(p.maturityDate)}`}
                    </span>
                    <span className={styles.pickerCardMeta}>Projected payout: {fmt(p.totalPayout)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
