import { useRef } from 'react';

import { useCustomCursor } from '../model/use-custom-cursor';

export function CustomCursor() {
  const auraRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useCustomCursor({ auraRef, dotRef, labelRef });

  return (
    <>
      <div ref={auraRef} className='cursor-aura' aria-hidden='true'>
        <span ref={labelRef} />
      </div>
      <div ref={dotRef} className='cursor-dot' aria-hidden='true' />
    </>
  );
}
