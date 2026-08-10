import { useRef } from 'react';

import styles from './styles/custom-cursor.module.css';
import { useCustomCursor } from './use-custom-cursor';

export function CustomCursor() {
  const auraRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useCustomCursor({ auraRef, dotRef });

  return (
    <>
      <div
        ref={auraRef}
        className={styles.cursorAura}
        data-landing-cursor-ring
        aria-hidden='true'
      />
      <div ref={dotRef} className={styles.cursorDot} data-landing-cursor-dot aria-hidden='true' />
    </>
  );
}
