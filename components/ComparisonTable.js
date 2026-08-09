import styles from './ComparisonTable.module.css';

const rows = [
  {
    feature: 'Annual Percentage Yield (MPY)',
    solo: '10%',
    duo: '15%',
    family: '30%',
  },
  {
    feature: 'Number of Users',
    solo: '1 User',
    duo: '2 Users',
    family: 'Up to 5 Users',
  },
  {
    feature: 'Savings Goals',
    solo: 'Unlimited',
    duo: 'Unlimited (Joint)',
    family: 'Unlimited (Joint & Sub)',
  },
  {
    feature: 'Round-up Automation',
    solo: '✓',
    duo: '✓',
    family: '✓',
    checkRow: true,
  },
  {
    feature: 'Financial Advisor',
    solo: '—',
    duo: 'Chat Priority',
    family: 'Dedicated Advisor',
  },
  {
    feature: 'Education Tools',
    solo: 'Basic Articles',
    duo: 'Interactive Modules',
    family: "Curated Kid's Courses",
  },
];

export default function ComparisonTable() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>A Deeper Breakdown</h2>
          <p className={styles.subtext}>
            Compare features side-by-side to find the right fit for your capital.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.featureHead}>FEATURE SET</th>
                <th className={styles.colHead}>Solo</th>
                <th className={`${styles.colHead} ${styles.duoHead}`}>Duo</th>
                <th className={styles.colHead}>Family</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className={styles.row}>
                  <td className={styles.featureCell}>{row.feature}</td>
                  <td className={`${styles.cell} ${row.checkRow ? styles.checkCell : ''}`}>
                    {row.solo}
                  </td>
                  <td className={`${styles.cell} ${styles.duoCell} ${row.checkRow ? styles.checkCell : ''}`}>
                    {row.duo}
                  </td>
                  <td className={`${styles.cell} ${row.checkRow ? styles.checkCell : ''}`}>
                    {row.family}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
