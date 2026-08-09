import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>Trusted by 2M+ Savers</div>
          <h1 className={styles.heading}>
            Grow Your Future,<br />Together
          </h1>
          <p className={styles.subtext}>
            Secure your financial legacy with flexible savings plans designed for every
            stage of life. From solo goals to generational wealth.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryBtn}>Start Saving Today</Link>
            <Link href="/calculator" className={styles.secondaryBtn}>Calculate Earnings</Link>
          </div>
        </div>

        <div className={styles.imageCol}>
          <div className={styles.imageCard}>
            <Image
              src="/images/family.png"
              alt="A family reviewing their savings plan together"
              fill
              sizes="(max-width: 900px) 0px, 440px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className={styles.yieldBadge}>
            <span className={styles.yieldArrow}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 12V4M4 8l4-4 4 4" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <div className={styles.yieldLabel}>Average Yield</div>
              <div className={styles.yieldValue}>2.2% MPY</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
