import Link from 'next/link';
import styles from './Footer.module.css';

const footerLinks = [
  { href: '/privacy',  label: 'Privacy Policy' },
  { href: '/terms',    label: 'Terms of Service' },
  { href: '/security', label: 'Security' },
  { href: '/support',  label: 'Help Center' },
];

function GlobeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5"  r="3" />
      <circle cx="6"  cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.left}>
          <Link href="/" className={styles.logo}>Vaulta</Link>
          <p className={styles.copyright}>
            © 2024 Vaulta Financial. Secure and protected growth.
          </p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          {footerLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link}>{label}</Link>
          ))}
        </nav>

        <div className={styles.icons}>
          <span className={styles.iconBtn} title="Global"><GlobeIcon /></span>
          <span className={styles.iconBtn} title="Network"><NetworkIcon /></span>
        </div>

      </div>
    </footer>
  );
}
