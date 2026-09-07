'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './CryptoPaymentCard.module.css';

const Ic = {
  Copy:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Bitcoin:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.5 13.5H9v-3h4.5a1.5 1.5 0 0 1 0 3zM9 12V9h4a1.5 1.5 0 0 1 0 3z"/></svg>,
  Ethereum: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 12 12 22 22 12"/></svg>,
};

function fmt(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.copyBtn}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
      }}
    >
      {copied ? <Ic.Check /> : <Ic.Copy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* Shared crypto payment picker: network toggle + QR code + address, used
   everywhere a real receiving address is shown (deposit + all 3 vault
   create/deposit flows) so the QR/animation/copy behavior stays in one place. */
export default function CryptoPaymentCard({ bitcoin, ethereum }) {
  const [selNet, setSelNet] = useState('bitcoin');
  const netInfo = selNet === 'bitcoin' ? bitcoin : ethereum;

  return (
    <div className={styles.wrap}>
      <div className={styles.netToggleRow}>
        <button
          type="button"
          className={`${styles.netToggle} ${selNet === 'bitcoin' ? styles.netToggleActive : ''}`}
          onClick={() => setSelNet('bitcoin')}
        >
          <Ic.Bitcoin /> Bitcoin
        </button>
        <button
          type="button"
          className={`${styles.netToggle} ${selNet === 'ethereum' ? styles.netToggleActive : ''}`}
          onClick={() => setSelNet('ethereum')}
        >
          <Ic.Ethereum /> Ethereum
        </button>
      </div>

      {netInfo && (
        <div key={selNet} className={styles.addressCard}>
          <div className={styles.addressLabel}>
            <span className={styles.networkBadge}>{netInfo.network}</span>
            <span className={styles.addressMeta}>Send exactly {fmt(netInfo.amountToPay)}</span>
          </div>

          <div className={styles.qrWrap}>
            <QRCodeSVG value={netInfo.address} size={132} level="M" bgColor="#ffffff" fgColor="#0D2B1F" />
          </div>

          <div className={styles.addressRow}>
            <code className={styles.addressCode}>{netInfo.address}</code>
            <CopyBtn text={netInfo.address} />
          </div>
        </div>
      )}
    </div>
  );
}
