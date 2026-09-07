'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { duoSavingsApi, familySavingsApi, authApi } from '@/lib/api';
import styles from './page.module.css';

const Ic = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Search:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  UserPlus:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Users:     () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  X:         () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initials(u) {
  if (!u) return '?';
  return u.username?.[0]?.toUpperCase() || '?';
}

const CAP = { DUO: 2, FAMILY: 5 };

function SendInviteCard({ plan, onInvited }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
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
      const api = plan.vaultType === 'DUO' ? duoSavingsApi : familySavingsApi;
      await api.invite(plan.id, { invitedUserId: found.id });
      setSent(true);
      onInvited();
    } catch (err) {
      setError(err.message || 'Failed to send invite. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pickerCard} style={{ cursor: 'default' }}>
      <div className={styles.pickerCardHead}>
        <span className={styles.pickerCardBadge}>{plan.vaultType === 'DUO' ? 'Duo Vault' : 'Family Vault'}</span>
        <span className={styles.pickerCardMeta}>{plan.participants?.length ?? 1}/{CAP[plan.vaultType]}</span>
      </div>
      <span className={styles.pickerCardAmount}>{fmt(plan.amountSaved)}</span>

      {!open ? (
        <button type="button" className={styles.ghostBtn} onClick={() => setOpen(true)}>
          <Ic.UserPlus /> Invite Someone
        </button>
      ) : (
        <div className={styles.field}>
          {sent && <div className={styles.successBanner}>Invitation sent to @{found?.username}!</div>}
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}
          {!sent && (
            <>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}><Ic.Search /></span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search by username"
                  value={query}
                  onChange={handleQueryChange}
                  autoFocus
                />
                {searching && <span className={styles.searchSpinner} />}
              </div>
              {searchErr && <span className={styles.hint} style={{ color: '#b91c1c' }}>{searchErr}</span>}

              {found && (
                <div className={styles.userFound}>
                  <div className={styles.foundAvatar}>{initials(found)}</div>
                  <div className={styles.foundInfo}>
                    <span className={styles.foundName}>@{found.username}</span>
                  </div>
                </div>
              )}

              <button type="button" className={styles.primaryBtn} onClick={handleInvite} disabled={!found || loading}>
                {loading ? 'Sending…' : 'Send Invite'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function InvitePage() {
  const [received, setReceived] = useState([]);
  const [ownedPlans, setOwnedPlans] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [duoInvites, familyInvites, duoPlans, familyPlans, meRes] = await Promise.all([
        duoSavingsApi.getInvites(),
        familySavingsApi.getInvites(),
        duoSavingsApi.getMyPlans(),
        familySavingsApi.getMyPlans(),
        authApi.getMe(),
      ]);
      const meId = meRes.data?.user?.id;
      setMe(meRes.data?.user ?? null);

      setReceived([
        ...(duoInvites.data ?? []).map((i) => ({ ...i, vaultType: 'DUO' })),
        ...(familyInvites.data ?? []).map((i) => ({ ...i, vaultType: 'FAMILY' })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      const eligibleOwned = [
        ...(duoPlans.data ?? []).filter((p) => p.createdById === meId && p.status === 'ACTIVE' && (p.participants?.length ?? 1) < CAP.DUO).map((p) => ({ ...p, vaultType: 'DUO' })),
        ...(familyPlans.data ?? []).filter((p) => p.createdById === meId && p.status === 'ACTIVE' && (p.participants?.length ?? 1) < CAP.FAMILY).map((p) => ({ ...p, vaultType: 'FAMILY' })),
      ];
      setOwnedPlans(eligibleOwned);
    } catch (err) {
      setError(err.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAccept(invite) {
    setBusyId(invite.id);
    try {
      const api = invite.vaultType === 'DUO' ? duoSavingsApi : familySavingsApi;
      await api.acceptInvite(invite.id);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to accept invite');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(invite) {
    setBusyId(invite.id);
    try {
      const api = invite.vaultType === 'DUO' ? duoSavingsApi : familySavingsApi;
      await api.rejectInvite(invite.id);
      setReceived((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err) {
      setError(err.message || 'Failed to decline invite');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}><Ic.ArrowLeft /> Back to Dashboard</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Invite</h1>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.pickerGrid}>
          {[1, 2].map((i) => <div key={i} className={styles.skeletonCard} style={{ height: 130 }} />)}
        </div>
      ) : (
        <>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Pending Invitations</h2>
            {received.length === 0 ? (
              <p className={styles.hint}>You have no pending invitations.</p>
            ) : (
              <div className={styles.pickerGrid}>
                {received.map((inv) => (
                  <div key={inv.id} className={styles.pickerCard} style={{ cursor: 'default' }}>
                    <div className={styles.pickerCardHead}>
                      <span className={styles.pickerCardBadge}>{inv.vaultType === 'DUO' ? 'Duo Vault' : 'Family Vault'}</span>
                      <span className={styles.pickerCardMeta}>{fmtDate(inv.createdAt)}</span>
                    </div>
                    <span className={styles.pickerCardMeta}>
                      From @{inv.duoSavings?.createdBy?.username ?? inv.familySavings?.createdBy?.username ?? 'a vault owner'}
                    </span>
                    <div className={styles.modalFooter} style={{ padding: 0 }}>
                      <button type="button" className={styles.ghostBtn} onClick={() => handleDecline(inv)} disabled={busyId === inv.id}>
                        <Ic.X /> Decline
                      </button>
                      <button type="button" className={styles.primaryBtn} onClick={() => handleAccept(inv)} disabled={busyId === inv.id}>
                        {busyId === inv.id ? '…' : <><Ic.Check /> Accept</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Invite Someone</h2>
            {ownedPlans.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Ic.Users /></div>
                <h3 className={styles.emptyTitle}>No vault with room to invite</h3>
                <p className={styles.hint}>You need to own an active Duo or Family vault with a free slot.</p>
                <Link href="/dashboard/vaults" className={styles.primaryBtn}>View My Vaults</Link>
              </div>
            ) : (
              <div className={styles.pickerGrid}>
                {ownedPlans.map((p) => (
                  <SendInviteCard key={p.id} plan={p} onInvited={load} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
