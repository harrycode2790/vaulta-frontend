import Link from 'next/link';
import styles from './PricingSection.module.css';

const plans = [
  {
    name: 'The Solo Saver',
    subtitle: 'Perfect for individual goals',
    rate: '10',
    features: [
      { label: 'Individual goals' },
      { label: 'Automated round-ups' },
      { label: 'Basic analytics' },
      { label: 'Standard mobile app' },
    ],
    cta: 'Start Solo',
    href: '/signup?plan=solo',
    featured: false,
  },
  {
    name: 'Double the Growth',
    subtitle: 'Built for partners and duos',
    rate: '15',
    features: [
      { label: 'Everything in Solo, plus:', isHeader: true },
      { label: 'Up to 2 users' },
      { label: 'Joint savings goals' },
      { label: 'Automated split transfers' },
      { label: 'Priority chat support' },
    ],
    cta: 'Start Together',
    href: '/signup?plan=duo',
    featured: true,
  },
  {
    name: 'Household Wealth',
    subtitle: 'The complete family solution',
    rate: '30',
    features: [
      { label: 'Everything in Duo, plus:', isHeader: true },
      { label: 'Up to 5 user accounts' },
      { label: 'Sub-accounts for kids' },
      { label: 'Financial education tools' },
      { label: 'Dedicated financial advisor' },
    ],
    cta: 'Protect Family',
    href: '/signup?plan=family',
    featured: false,
  },
];

function CheckIcon({ featured }) {
  return (
    <svg
      className={`${styles.check} ${featured ? styles.checkFeatured : ''}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 10.5l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Choose Your Growth Strategy</h2>
          <p className={styles.subtext}>
            Our transparent pricing ensures you keep more of what you earn. No hidden
            fees, just crystalline clarity for your capital.
          </p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.card} ${plan.featured ? styles.featured : ''}`}
            >
              {plan.featured && (
                <span className={styles.popularBadge}>MOST POPULAR</span>
              )}
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planSubtitle}>{plan.subtitle}</p>
              <div className={styles.rateRow}>
                <span className={styles.rateNum}>{plan.rate}%</span>
                <span className={styles.rateSuffix}>MPY</span>
              </div>
              <ul className={styles.features}>
                {plan.features.map((f) =>
                  f.isHeader ? (
                    <li key={f.label} className={styles.featureHeader}>{f.label}</li>
                  ) : (
                    <li key={f.label} className={styles.featureItem}>
                      <CheckIcon featured={plan.featured} />
                      {f.label}
                    </li>
                  )
                )}
              </ul>
              <Link
                href={plan.href}
                className={`${styles.ctaBtn} ${plan.featured ? styles.ctaBtnFeatured : ''}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
