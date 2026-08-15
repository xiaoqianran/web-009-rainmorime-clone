// ============================================================
// TrustFeedback — Floating number animation showing trust delta
// Positive: green float-up; Negative: red float-down; Zero: grey fade
// ============================================================

import React, { useEffect, useRef } from 'react';
import styles from '../../../styles/Game.module.scss';

interface TrustFeedbackProps {
  delta: number;
  onComplete: () => void;
}

export default function TrustFeedback({ delta, onComplete }: TrustFeedbackProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(onComplete, 2400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onComplete]);

  if (delta === 0) return null;

  const label = delta > 0 ? `+${delta}` : `${delta}`;
  const modifier = delta > 0 ? styles.trustPositive : styles.trustNegative;

  return (
    <div className={`${styles.trustFeedback} ${modifier}`}>
      <span className={styles.trustDeltaLabel}>TRUST {label}</span>
    </div>
  );
}
