'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardNav.module.css';

const navLinks = [
  { href: '/dashboard',           label: 'Dashboard' },
  { href: '/dashboard/vaults',    label: 'My Vaults' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/settings',  label: 'Settings' },
];

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link href="/" className={styles.logo}>Vaulta</Link>

        <ul className={styles.links}>
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${pathname === href ? styles.active : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button className={styles.bellBtn} aria-label="Notifications">
            <BellIcon />
            <span className={styles.bellDot} aria-hidden="true" />
          </button>
          <div className={styles.sep} aria-hidden="true" />
          <button className={styles.userBtn} aria-label="User menu">
            <span className={styles.avatar}>A</span>
            <span className={styles.userName}>Alex</span>
            <ChevronIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
