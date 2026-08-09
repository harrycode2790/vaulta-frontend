import Link from 'next/link';
import styles from './CTABanner.module.css';

export default function CTABanner() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Ready to build your legacy?</h2>
        <p className={styles.subtext}>
          Join thousands of families who have found financial peace with Vaulta.
        </p>
        <div className={styles.actions}>
          <Link href="/signup" className={styles.primaryBtn}>Get Started for Free</Link>
          <Link href="/contact" className={styles.secondaryBtn}>Speak to an Advisor</Link>
        </div>
      </div>
    </section>
  );
}
