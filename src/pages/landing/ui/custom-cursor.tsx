import { useRef } from 'react';

import styles from './styles/custom-cursor.module.css';
import { useCustomCursor } from './use-custom-cursor';

export function CustomCursor() {
  const auraRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useCustomCursor({ auraRef, dotRef, labelRef });

  return (
    <>
      <div ref={auraRef} className={styles.cursorAura} data-custom-cursor-aura aria-hidden='true'>
        <span ref={labelRef} />
      </div>
      <div ref={dotRef} className={styles.cursorDot} aria-hidden='true' />
    </>
  );
}
