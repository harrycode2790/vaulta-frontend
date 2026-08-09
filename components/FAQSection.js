'use client';
import { useState } from 'react';
import styles from './FAQSection.module.css';

const faqs = [
  {
    question: 'How secure is Vaulta?',
    answer:
      'Vaulta uses 256-bit AES encryption and is FDIC insured up to $250,000 per depositor. Our infrastructure is monitored 24/7 and protected by bank-grade security protocols, including multi-factor authentication and biometric verification.',
  },
  {
    question: 'Are interest rates fixed or variable?',
    answer:
      'Our rates are variable and adjust with market conditions. We update rates monthly and always display your current yield prominently in your dashboard — no surprises, no hidden fees.',
  },
  {
    question: 'Can I upgrade my plan later?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time directly from your account settings. Changes take effect immediately with no fees, penalties, or loss of accrued interest.',
  },
  {
    question: 'How do joint accounts work?',
    answer:
      'Joint accounts on the Duo plan allow two account holders to share savings goals, track progress together, and set up automated split transfers. Both users have full visibility and equal access to the account.',
  },
];

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4.5 6.75L9 11.25L13.5 6.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Frequently Asked Questions</h2>
          <p className={styles.subtext}>
            Find the answers you need to start growing your vault today.
          </p>
        </div>

        <div className={styles.list}>
          {faqs.map((faq, i) => (
            <div key={i} className={styles.item}>
              <button
                className={styles.question}
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <span>{faq.question}</span>
                <span className={`${styles.chevron} ${openIndex === i ? styles.open : ''}`}>
                  <ChevronIcon />
                </span>
              </button>
              {openIndex === i && (
                <p className={styles.answer}>{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
