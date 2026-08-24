'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebar from './DashboardSidebar';
import SupportChat from './SupportChat';
import { authApi } from '@/lib/api';
import styles from './DashboardShell.module.css';

const PAGE_TITLES = {
  '/dashboard':              { title: 'Dashboard',    sub: null },
  '/dashboard/vaults':       { title: 'My Vaults',    sub: 'Manage your savings plans' },
  '/dashboard/analytics':    { title: 'Analytics',    sub: 'Track your growth' },
  '/dashboard/transactions': { title: 'Transactions', sub: 'Your full history' },
  '/dashboard/settings':     { title: 'Settings',     sub: 'Manage your account' },
};

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function initials(user) {
  if (!user) return '?';
  return user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function DashboardShell({ children }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    authApi.getMe()
      .then((res) => setUser(res.data?.user ?? null))
      .catch((err) => {
        if (err.status === 401) router.replace('/login');
      });
  }, [router]);

  const close  = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  const { title, sub } = PAGE_TITLES[pathname] ?? { title: 'Dashboard', sub: null };

  return (
    <div className={styles.shell}>

      {/* ── Backdrop (mobile) ── */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <DashboardSidebar open={open} onClose={close} user={user} />

      {/* ── Right column ── */}
      <div className={styles.main}>

        {/* Top bar */}
        <header className={styles.topBar}>
          <div className={styles.topLeft}>
            <button
              className={styles.menuBtn}
              onClick={toggle}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              <HamburgerIcon />
            </button>
            <Link href="/" className={styles.mobileLogo}>Vaulta</Link>
            <div className={styles.titleGroup}>
              <h1 className={styles.pageTitle}>{title}</h1>
              {sub
                ? <span className={styles.pageDate}>{sub}</span>
                : <span className={styles.pageDate}>{todayLabel()}</span>
              }
            </div>
          </div>

          <div className={styles.topRight}>
            <button className={styles.bellBtn} aria-label="Notifications">
              <BellIcon />
              <span className={styles.bellDot} aria-hidden="true" />
            </button>
            <div className={styles.avatar} title={user ? `@${user.username}` : ''} aria-label="User avatar">
              {initials(user)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.body}>{children}</div>

      </div>

      {/* Floating support chat */}
      <SupportChat />

    </div>
  );
}
