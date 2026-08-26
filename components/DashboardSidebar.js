'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { userToken } from '@/lib/tokenStorage';
import styles from './DashboardSidebar.module.css';

/* ── Icons ── */
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function VaultIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>;
}
function ChartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
function ListIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function LogOutIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function XIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',    Icon: HomeIcon },
  { href: '/dashboard/vaults',       label: 'My Vaults',    Icon: VaultIcon },
  { href: '/dashboard/analytics',    label: 'Analytics',    Icon: ChartIcon },
  { href: '/dashboard/transactions', label: 'Transactions', Icon: ListIcon },
  { href: '/dashboard/settings',     label: 'Settings',     Icon: SettingsIcon },
];

function initials(user) {
  if (!user) return '?';
  return user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

export default function DashboardSidebar({ open = false, onClose = () => {}, user = null }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    userToken.clear();
    router.replace('/login');
  }

  const displayName = user
    ? (user.username ? `@${user.username}` : user.email)
    : '…';

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>

      {/* Logo + mobile close button */}
      <div className={styles.logoRow}>
        <Link href="/" className={styles.logo}>Vaulta</Link>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close navigation">
          <XIcon />
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>MENU</p>
        <ul className={styles.navList}>
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  onClick={onClose}
                >
                  <span className={styles.navIcon}><Icon /></span>
                  <span>{label}</span>
                  {active && <span className={styles.activeBar} aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className={styles.userSection}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials(user)}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userPlan}>{user?.email ?? '…'}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} aria-label="Sign out" onClick={handleLogout}>
          <LogOutIcon />
        </button>
      </div>
    </aside>
  );
}
