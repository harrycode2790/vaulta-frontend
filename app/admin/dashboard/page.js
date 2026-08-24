'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import styles from './page.module.css';

/* ══════════════════════════════════════
   Shared helpers
   ══════════════════════════════════════ */
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
function statusChip(s) {
  const map = {
    ACTIVE:      { bg: '#14532d', color: '#4ade80', label: 'ACTIVE' },
    MATURED:     { bg: '#713f12', color: '#fbbf24', label: 'MATURED' },
    WITHDRAWN:   { bg: '#1e293b', color: '#94a3b8', label: 'WITHDRAWN' },
    PENDING:     { bg: '#713f12', color: '#fbbf24', label: 'PENDING' },
    APPROVED:    { bg: '#14532d', color: '#4ade80', label: 'APPROVED' },
    REJECTED:    { bg: '#450a0a', color: '#f87171', label: 'REJECTED' },
    SUCCESSFUL:  { bg: '#14532d', color: '#4ade80', label: 'SUCCESSFUL' },
    OPEN:        { bg: '#1e3a5f', color: '#60a5fa', label: 'OPEN' },
    IN_PROGRESS: { bg: '#3b1f6e', color: '#c084fc', label: 'IN PROGRESS' },
    RESOLVED:    { bg: '#14532d', color: '#4ade80', label: 'RESOLVED' },
    CLOSED:      { bg: '#1e293b', color: '#94a3b8', label: 'CLOSED' },
  };
  const c = map[s] ?? { bg: '#1e293b', color: '#94a3b8', label: s };
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 8px', borderRadius: 100 }}>
      {c.label}
    </span>
  );
}

/* ══════════════════════════════════════
   Icons
   ══════════════════════════════════════ */
const Ic = {
  Users:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Vault:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Flag:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Chat:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Overview: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Eye:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Reply:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>,
  Send:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  ChevR:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevL:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Logout:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ══════════════════════════════════════
   Confirm dialog
   ══════════════════════════════════════ */
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p className={styles.dialogMsg}>{message}</p>
        <div className={styles.dialogBtns}>
          <button className={styles.dialogCancel} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={styles.dialogDanger} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION 1: Overview
   ══════════════════════════════════════ */
function OverviewSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getUsers('?limit=1'),
      adminApi.getSavings('?limit=1'),
      adminApi.getReports(),
      adminApi.getConversations(),
    ]).then(([usersRes, savingsRes, reportsRes, convsRes]) => {
      setData({
        totalUsers:    usersRes.pagination?.total ?? 0,
        totalSingle:   savingsRes.pagination?.singleSavings?.total ?? 0,
        totalDuo:      savingsRes.pagination?.duoSavings?.total ?? 0,
        totalFamily:   savingsRes.pagination?.familySavings?.total ?? 0,
        openReports:   (reportsRes.data ?? []).filter(r => r.status === 'OPEN').length,
        totalReports:  (reportsRes.data ?? []).length,
        openConvs:     (convsRes.data ?? []).filter(c => c.status === 'OPEN').length,
        totalConvs:    (convsRes.data ?? []).length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: 'Total Users',         value: data.totalUsers,                  color: '#60a5fa', bg: '#1e3a5f' },
    { label: 'Solo Plans',          value: data.totalSingle,                 color: '#4ade80', bg: '#14532d' },
    { label: 'Duo Plans',           value: data.totalDuo,                    color: '#60a5fa', bg: '#1e3a5f' },
    { label: 'Family Plans',        value: data.totalFamily,                 color: '#c084fc', bg: '#3b1f6e' },
    { label: 'Open Reports',        value: `${data.openReports} / ${data.totalReports}`,   color: '#fb923c', bg: '#431407' },
    { label: 'Open Conversations',  value: `${data.openConvs} / ${data.totalConvs}`,       color: '#fbbf24', bg: '#713f12' },
  ] : [];

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Overview</h2>
      <p className={styles.sectionSub}>Platform-wide snapshot</p>

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard} style={{ '--accent': s.color, '--accent-bg': s.bg }}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION 2: Users
   ══════════════════════════════════════ */
function UserSavingsDrawer({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUserSavings(userId).then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div>
            <h3 className={styles.drawerTitle}>{data?.user ? `@${data.user.username}` : 'User'} — Savings</h3>
            <p className={styles.drawerSub}>All savings plans for this user</p>
          </div>
          <button className={styles.closeX} onClick={onClose}>✕</button>
        </div>

        {loading ? <div className={styles.drawerLoading}>Loading…</div> : (
          <div className={styles.drawerBody}>
            {/* Summary */}
            <div className={styles.drawerSummaryRow}>
              {[
                { label: 'Solo Plans',   val: data?.summary?.totalSinglePlans ?? 0 },
                { label: 'Duo Plans',    val: data?.summary?.totalDuoPlans ?? 0 },
                { label: 'Family Plans', val: data?.summary?.totalFamilyPlans ?? 0 },
                { label: 'Total Plans',  val: data?.summary?.totalPlans ?? 0 },
              ].map(s => (
                <div key={s.label} className={styles.drawerStat}>
                  <span className={styles.drawerStatVal}>{s.val}</span>
                  <span className={styles.drawerStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Single */}
            {(data?.singleSavings ?? []).length > 0 && (
              <div className={styles.drawerGroup}>
                <h4 className={styles.drawerGroupTitle}>Solo Plans</h4>
                {data.singleSavings.map(p => (
                  <div key={p.id} className={styles.drawerPlanRow}>
                    <div className={styles.drawerPlanLeft}>
                      <span className={styles.drawerPlanAmt}>{fmt(p.amountSaved)}</span>
                      <span className={styles.drawerPlanMeta}>Payout {fmt(p.totalPayout)} · {fmtDate(p.maturityDate)}</span>
                    </div>
                    {statusChip(p.status)}
                  </div>
                ))}
              </div>
            )}

            {/* Duo */}
            {(data?.duoSavings ?? []).length > 0 && (
              <div className={styles.drawerGroup}>
                <h4 className={styles.drawerGroupTitle}>Duo Plans</h4>
                {data.duoSavings.map(p => (
                  <div key={p.id} className={styles.drawerPlanRow}>
                    <div className={styles.drawerPlanLeft}>
                      <span className={styles.drawerPlanAmt}>{fmt(p.amountSaved)}</span>
                      <span className={styles.drawerPlanMeta}>{p.participants?.length ?? 0} participants · {fmtDate(p.maturityDate)}</span>
                    </div>
                    {statusChip(p.status)}
                  </div>
                ))}
              </div>
            )}

            {/* Family */}
            {(data?.familySavings ?? []).length > 0 && (
              <div className={styles.drawerGroup}>
                <h4 className={styles.drawerGroupTitle}>Family Plans</h4>
                {data.familySavings.map(p => (
                  <div key={p.id} className={styles.drawerPlanRow}>
                    <div className={styles.drawerPlanLeft}>
                      <span className={styles.drawerPlanAmt}>{fmt(p.amountSaved)}</span>
                      <span className={styles.drawerPlanMeta}>{p.participants?.length ?? 0} participants · {fmtDate(p.maturityDate)}</span>
                    </div>
                    {statusChip(p.status)}
                  </div>
                ))}
              </div>
            )}

            {(data?.singleSavings?.length + data?.duoSavings?.length + data?.familySavings?.length === 0) && (
              <div className={styles.drawerEmpty}>No savings plans found for this user.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UsersSection() {
  const [users,    setUsers]    = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [viewUser, setViewUser] = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(`?page=${p}&limit=15&order=desc`);
      setUsers(res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [page]);

  async function handleDelete(userId) {
    setDeleting(true);
    try {
      await adminApi.deleteUser(userId);
      setConfirm(null);
      load(page);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  const filtered = search.trim()
    ? users.filter(u =>
        `${u.firstname} ${u.lastname} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Users</h2>
          <p className={styles.sectionSub}>{pagination?.total ?? '—'} total users</p>
        </div>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search name, email, username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={5}><div className={styles.skeletonRow} /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className={styles.emptyCell}>No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>{initials(u)}</div>
                    <span>@{u.username}</span>
                  </div>
                </td>
                <td className={styles.mutedCell}>{u.email}</td>
                <td>{u.isEmailVerified
                  ? <span className={styles.verifiedBadge}><Ic.Check /> Yes</span>
                  : <span className={styles.unverifiedBadge}>No</span>
                }</td>
                <td className={styles.mutedCell}>{fmtDate(u.createdAt)}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.viewBtn} onClick={() => setViewUser(u.id)} title="View savings"><Ic.Eye /> Savings</button>
                    <button className={styles.delBtn} onClick={() => setConfirm(u)} title="Delete user"><Ic.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><Ic.ChevL /> Prev</button>
          <span className={styles.pageInfo}>Page {page} of {pagination.totalPages}</span>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>Next <Ic.ChevR /></button>
        </div>
      )}

      {viewUser && <UserSavingsDrawer userId={viewUser} onClose={() => setViewUser(null)} />}
      {confirm && (
        <ConfirmDialog
          message={`Delete @${confirm.username}? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION 3: Savings
   ══════════════════════════════════════ */
function SavingsSection() {
  const [tab,      setTab]      = useState('single');
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [confirm,  setConfirm]  = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSavings('?limit=50&order=desc');
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(type, id) {
    setDeleting(true);
    try {
      await adminApi.deleteSavings(type, id);
      setConfirm(null);
      load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  const TABS = [
    { key: 'single', label: 'Solo Plans',   items: data?.singleSavings ?? [] },
    { key: 'duo',    label: 'Duo Plans',    items: data?.duoSavings ?? [] },
    { key: 'family', label: 'Family Plans', items: data?.familySavings ?? [] },
  ];
  const current = TABS.find(t => t.key === tab);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Savings Plans</h2>
          <p className={styles.sectionSub}>All plans across all types</p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button key={t.key} className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            <span className={styles.tabCount}>{t.items.length}</span>
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Owner</th>
              <th>Saved</th>
              <th>Interest</th>
              <th>Payout</th>
              {tab !== 'single' && <th>Participants</th>}
              <th>Maturity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={tab !== 'single' ? 8 : 7}><div className={styles.skeletonRow} /></td></tr>
              ))
            ) : current?.items.length === 0 ? (
              <tr><td colSpan={8} className={styles.emptyCell}>No {current.label} found</td></tr>
            ) : current?.items.map((p) => {
              const owner = p.user ?? p.createdBy;
              return (
                <tr key={p.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar} style={{ width: 28, height: 28, fontSize: '0.625rem' }}>{initials(owner)}</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>@{owner?.username}</div>
                    </div>
                  </td>
                  <td className={styles.amtCell}>{fmt(p.amountSaved)}</td>
                  <td style={{ color: '#4ade80', fontSize: '0.8125rem' }}>+ {fmt(p.expectedInterest)}</td>
                  <td className={styles.amtCell}>{fmt(p.totalPayout)}</td>
                  {tab !== 'single' && <td className={styles.mutedCell}>{p.participants?.length ?? 0}</td>}
                  <td className={styles.mutedCell}>{fmtDate(p.maturityDate)}</td>
                  <td>{statusChip(p.status)}</td>
                  <td>
                    <button className={styles.delBtn} onClick={() => setConfirm({ type: tab, id: p.id, label: `${fmt(p.amountSaved)} plan` })} title="Delete plan">
                      <Ic.Trash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirm && (
        <ConfirmDialog
          message={`Delete this ${confirm.label}? This is irreversible.`}
          onConfirm={() => handleDelete(confirm.type, confirm.id)}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION 4: Reports
   ══════════════════════════════════════ */
const REPORT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function RespondModal({ report, onClose, onSaved }) {
  const [response, setResponse] = useState(report.adminResponse ?? '');
  const [status,   setStatus]   = useState(report.status ?? 'OPEN');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminApi.respondToReport(report.id, { adminResponse: response, status });
      setDone(true);
      onSaved();
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save response');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} style={{ maxWidth: 520, width: '100%' }}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Respond to Report</h3>
          <button className={styles.closeX} onClick={onClose}>✕</button>
        </div>

        {/* Report info */}
        <div className={styles.reportPreview}>
          <div className={styles.reportPreviewHead}>
            <span className={styles.reportCatBadge}>{report.category?.replace(/_/g, ' ')}</span>
            <span className={styles.reportSubject}>{report.subject}</span>
          </div>
          <p className={styles.reportDesc}>{report.description}</p>
          <div className={styles.reportUser}>
            <div className={styles.userAvatar} style={{ width: 26, height: 26, fontSize: '0.625rem' }}>{initials(report.user)}</div>
            <span>@{report.user?.username} · {fmtDate(report.createdAt)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.respondForm}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          {done  && <div className={styles.successBanner}>Response saved!</div>}

          <div className={styles.respondField}>
            <label className={styles.respondLabel}>ADMIN RESPONSE</label>
            <textarea
              className={styles.respondTextarea}
              placeholder="Write your response here…"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className={styles.respondField}>
            <label className={styles.respondLabel}>STATUS</label>
            <div className={styles.statusBtns}>
              {REPORT_STATUSES.map(s => (
                <button key={s} type="button"
                  className={`${styles.statusBtn} ${status === s ? styles.statusBtnActive : ''}`}
                  onClick={() => setStatus(s)}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.dialogBtns}>
            <button type="button" className={styles.dialogCancel} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.dialogPrimary} disabled={loading || done}>
              {loading ? 'Saving…' : 'Save Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportsSection() {
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [respond,  setRespond]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter,   setFilter]   = useState('ALL');
  const [error,    setError]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports();
      setReports(res.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await adminApi.deleteReport(id);
      setConfirm(null);
      load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  const FILTERS = ['ALL', ...REPORT_STATUSES];
  const filtered = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Reports</h2>
          <p className={styles.sectionSub}>{reports.length} total · {reports.filter(r => r.status === 'OPEN').length} open</p>
        </div>
        <div className={styles.filterRow}>
          {FILTERS.map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`} onClick={() => setFilter(f)}>
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.reportGrid}>
          {[1,2,3].map(i => <div key={i} className={styles.skeletonCard} style={{ height: 160 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>No reports {filter !== 'ALL' ? `with status ${filter}` : ''}.</div>
      ) : (
        <div className={styles.reportGrid}>
          {filtered.map(r => (
            <div key={r.id} className={styles.reportCard}>
              <div className={styles.reportCardHead}>
                <span className={styles.reportCatBadge}>{r.category?.replace(/_/g, ' ')}</span>
                {statusChip(r.status)}
              </div>
              <h4 className={styles.reportSubject}>{r.subject}</h4>
              <p className={styles.reportDesc} style={{ WebkitLineClamp: 2 }}>{r.description}</p>
              <div className={styles.reportMeta}>
                <div className={styles.userCell}>
                  <div className={styles.userAvatar} style={{ width: 24, height: 24, fontSize: '0.5625rem' }}>{initials(r.user)}</div>
                  <span>@{r.user?.username}</span>
                </div>
                <span className={styles.mutedCell}>{fmtDate(r.createdAt)}</span>
              </div>
              {r.adminResponse && (
                <div className={styles.adminReply}>
                  <span className={styles.adminReplyLabel}>Admin reply:</span>
                  <span>{r.adminResponse}</span>
                </div>
              )}
              <div className={styles.reportActions}>
                <button className={styles.replyBtn} onClick={() => setRespond(r)}>
                  <Ic.Reply /> {r.adminResponse ? 'Edit Response' : 'Respond'}
                </button>
                <button className={styles.delBtn} onClick={() => setConfirm(r)}>
                  <Ic.Trash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {respond && <RespondModal report={respond} onClose={() => setRespond(null)} onSaved={load} />}
      {confirm && (
        <ConfirmDialog
          message={`Delete this report "${confirm.subject}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION 5: Support
   ══════════════════════════════════════ */
function SupportSection() {
  const [conversations, setConversations] = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [message,       setMessage]       = useState('');
  const [sending,       setSending]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminApi.getConversations();
      const convs = res.data ?? [];
      setConversations(convs);
      // update selected if open
      setSelected(prev => {
        if (!prev) return prev;
        return convs.find(c => c.id === prev.id) ?? prev;
      });
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll every 5s
  useEffect(() => {
    pollRef.current = setInterval(() => load(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !selected || sending) return;
    setError('');
    setSending(true);
    setMessage('');
    try {
      await adminApi.replyToConversation(selected.id, { message: trimmed });
      await load(true);
    } catch (err) {
      setError(err.message || 'Failed to send');
      setMessage(trimmed);
    } finally {
      setSending(false);
    }
  }

  function lastMsg(conv) {
    const msgs = conv.messages ?? [];
    return msgs[msgs.length - 1] ?? null;
  }

  function fmtTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const selectedConv = selected ? conversations.find(c => c.id === selected.id) ?? selected : null;
  const msgs = selectedConv?.messages ?? [];

  return (
    <div className={styles.section} style={{ padding: 0, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div className={styles.supportShell}>

        {/* Conversation list */}
        <div className={styles.convList}>
          <div className={styles.convListHeader}>
            <h2 className={styles.convListTitle}>Support</h2>
            <span className={styles.convCount}>{conversations.length}</span>
          </div>

          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className={`${styles.skeletonCard} ${styles.convSkeleton}`} />)
          ) : conversations.length === 0 ? (
            <div className={styles.emptyConv}>No conversations yet.</div>
          ) : conversations.map(conv => {
            const last = lastMsg(conv);
            const isActive = selectedConv?.id === conv.id;
            const hasUnread = (conv.messages ?? []).some(m => m.senderType === 'USER');
            return (
              <button key={conv.id} className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`} onClick={() => setSelected(conv)}>
                <div className={styles.convAvatar}>{initials(conv.user)}</div>
                <div className={styles.convMeta}>
                  <div className={styles.convName}>@{conv.user?.username}</div>
                  <div className={styles.convPreview}>{last?.message?.slice(0, 48) ?? 'No messages'}</div>
                </div>
                <div className={styles.convRight}>
                  {last && <span className={styles.convTime}>{fmtTime(last.createdAt)}</span>}
                  {statusChip(conv.status)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat window */}
        <div className={styles.chatWindow}>
          {!selectedConv ? (
            <div className={styles.chatPlaceholder}>
              <Ic.Chat />
              <p>Select a conversation to start replying</p>
            </div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.userCell}>
                  <div className={styles.userAvatar}>{initials(selectedConv.user)}</div>
                  <div>
                    <div className={styles.chatUserName}>@{selectedConv.user?.username}</div>
                    <div className={styles.chatUserEmail}>{selectedConv.user?.email}</div>
                  </div>
                </div>
                {statusChip(selectedConv.status)}
              </div>

              <div className={styles.chatMessages}>
                {msgs.map((m, i) => (
                  <div key={m.id ?? i} className={`${styles.chatMsgRow} ${m.senderType === 'ADMIN' ? styles.chatMsgAdmin : styles.chatMsgUser}`}>
                    {m.senderType !== 'ADMIN' && (
                      <div className={styles.chatMsgAvatar}>{initials(selectedConv.user)}</div>
                    )}
                    <div className={`${styles.chatBubble} ${m.senderType === 'ADMIN' ? styles.chatBubbleAdmin : styles.chatBubbleUser}`}>
                      <p className={styles.chatBubbleText}>{m.message}</p>
                      <span className={styles.chatBubbleTime}>{fmtTime(m.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {error && <div className={styles.errorBanner} style={{ margin: '0 16px 8px' }}>{error}</div>}

              <form className={styles.chatInput} onSubmit={handleSend}>
                <textarea
                  className={styles.chatTextarea}
                  placeholder="Type your reply…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
                  rows={1}
                  disabled={sending}
                />
                <button type="submit" className={styles.chatSendBtn} disabled={!message.trim() || sending}>
                  <Ic.Send />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION 6: Pending Approvals
   ══════════════════════════════════════ */
function ApprovalRow({ title, subtitle, amount, busy, onApprove, onReject }) {
  return (
    <div className={styles.reportCard}>
      <div className={styles.reportCardHead}>
        <span className={styles.reportSubject}>{title}</span>
        <span className={styles.amtCell}>{fmt(amount)}</span>
      </div>
      <p className={styles.reportDesc}>{subtitle}</p>
      <div className={styles.reportActions}>
        <button className={styles.delBtn} onClick={onReject} disabled={busy} title="Reject">
          Reject
        </button>
        <button className={styles.replyBtn} onClick={onApprove} disabled={busy}>
          {busy ? 'Processing…' : <><Ic.Check /> Approve</>}
        </button>
      </div>
    </div>
  );
}

function ApprovalsSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId,  setBusyId]  = useState(null);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSavings('?limit=100&order=desc');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingPlans = [
    ...(data?.singleSavings ?? []).filter(p => p.status === 'PENDING').map(p => ({ type: 'single', plan: p })),
    ...(data?.duoSavings ?? []).filter(p => p.status === 'PENDING').map(p => ({ type: 'duo', plan: p })),
    ...(data?.familySavings ?? []).filter(p => p.status === 'PENDING').map(p => ({ type: 'family', plan: p })),
  ];

  const pendingDeposits = [
    ...(data?.duoSavings ?? []).flatMap(p => (p.deposits ?? []).filter(d => d.status === 'PENDING').map(d => ({ type: 'duo', deposit: d, plan: p }))),
    ...(data?.familySavings ?? []).flatMap(p => (p.deposits ?? []).filter(d => d.status === 'PENDING').map(d => ({ type: 'family', deposit: d, plan: p }))),
  ];

  const pendingWithdrawals = (data?.singleSavings ?? []).flatMap(p =>
    (p.withdrawals ?? []).filter(w => w.status === 'PENDING').map(w => ({ withdrawal: w, plan: p }))
  );

  async function runAction(id, fn) {
    setBusyId(id);
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  const totalPending = pendingPlans.length + pendingDeposits.length + pendingWithdrawals.length;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Pending Approvals</h2>
          <p className={styles.sectionSub}>{totalPending} item{totalPending !== 1 ? 's' : ''} awaiting review</p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.reportGrid}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} style={{ height: 140 }} />)}
        </div>
      ) : totalPending === 0 ? (
        <div className={styles.emptyState}>All caught up — nothing pending approval.</div>
      ) : (
        <>
          {pendingPlans.length > 0 && (
            <div className={styles.drawerGroup}>
              <h4 className={styles.drawerGroupTitle}>Plan Creations</h4>
              <div className={styles.reportGrid}>
                {pendingPlans.map(({ type, plan }) => {
                  const owner = plan.user ?? plan.createdBy;
                  const id = `plan-${type}-${plan.id}`;
                  return (
                    <ApprovalRow
                      key={id}
                      title={`${type} vault — @${owner?.username}`}
                      subtitle={`Requested ${fmtDate(plan.createdAt)}`}
                      amount={plan.amountSaved}
                      busy={busyId === id}
                      onApprove={() => runAction(id, () => adminApi.approveSavingsPlan(type, plan.id))}
                      onReject={() => runAction(id, () => adminApi.rejectSavingsPlan(type, plan.id))}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {pendingDeposits.length > 0 && (
            <div className={styles.drawerGroup}>
              <h4 className={styles.drawerGroupTitle}>Deposits</h4>
              <div className={styles.reportGrid}>
                {pendingDeposits.map(({ type, deposit, plan }) => {
                  const owner = plan.user ?? plan.createdBy;
                  const id = `deposit-${type}-${deposit.id}`;
                  return (
                    <ApprovalRow
                      key={id}
                      title={`${type} deposit — @${deposit.depositedBy?.username}`}
                      subtitle={`Into ${owner?.username}'s vault · ${fmtDate(deposit.createdAt)}`}
                      amount={deposit.amount}
                      busy={busyId === id}
                      onApprove={() => runAction(id, () => adminApi.approveDeposit(type, deposit.id))}
                      onReject={() => runAction(id, () => adminApi.rejectDeposit(type, deposit.id))}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {pendingWithdrawals.length > 0 && (
            <div className={styles.drawerGroup}>
              <h4 className={styles.drawerGroupTitle}>Solo Withdrawals</h4>
              <div className={styles.reportGrid}>
                {pendingWithdrawals.map(({ withdrawal, plan }) => {
                  const id = `withdrawal-${withdrawal.id}`;
                  return (
                    <ApprovalRow
                      key={id}
                      title={`@${plan.user?.username} — ${withdrawal.WalletType ?? 'wallet'}`}
                      subtitle={`Requested ${fmtDate(withdrawal.createdAt)}`}
                      amount={withdrawal.amount}
                      busy={busyId === id}
                      onApprove={() => runAction(id, () => adminApi.approveSingleWithdrawal(withdrawal.id))}
                      onReject={() => runAction(id, () => adminApi.rejectSingleWithdrawal(withdrawal.id))}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   Admin Shell + Page
   ══════════════════════════════════════ */
const NAV = [
  { key: 'overview',   label: 'Overview',   Icon: Ic.Overview },
  { key: 'users',      label: 'Users',      Icon: Ic.Users },
  { key: 'savings',    label: 'Savings',    Icon: Ic.Vault },
  { key: 'approvals',  label: 'Approvals',  Icon: Ic.Check },
  { key: 'reports',    label: 'Reports',    Icon: Ic.Flag },
  { key: 'support',    label: 'Support',    Icon: Ic.Chat },
];

export default function AdminDashboard() {
  const [section, setSection] = useState('overview');
  const router = useRouter();

  function logout() {
    // Clear the cookie by expiring it via the user logout endpoint
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:46753'}/api/auth/logout`, {
      method: 'POST', credentials: 'include',
    }).finally(() => router.replace('/admin/login'));
  }

  return (
    <div className={styles.shell}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoMark}>V</span>
            <div>
              <div className={styles.sidebarBrand}>Vaulta</div>
              <div className={styles.sidebarRole}>Admin Panel</div>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV.map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`${styles.navItem} ${section === key ? styles.navItemActive : ''}`}
                onClick={() => setSection(key)}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button className={styles.logoutBtn} onClick={logout}>
          <Ic.Logout />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {section === 'overview'  && <OverviewSection />}
        {section === 'users'     && <UsersSection />}
        {section === 'savings'   && <SavingsSection />}
        {section === 'approvals' && <ApprovalsSection />}
        {section === 'reports'   && <ReportsSection />}
        {section === 'support'   && <SupportSection />}
      </main>
    </div>
  );
}
