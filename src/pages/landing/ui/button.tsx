import { type ComponentPropsWithoutRef, useRef, useState } from 'react';

import { setPointerSpotlight } from '../model/use-pointer-spotlight';

type ButtonVariant = 'primary' | 'blue' | 'ghost';

type ButtonProps = ComponentPropsWithoutRef<'a'> & {
  variant?: ButtonVariant;
  cursorText?: string;
};

export function Button({
  variant = 'primary',
  cursorText,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const timerRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handlePointerEnter = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setIsHovering(true);
  };

  const handlePointerLeave = () => {
    timerRef.current = window.setTimeout(() => setIsHovering(false), 80);
  };

  return (
    <a
      className={`btn btn-${variant} ${isHovering ? 'is-hovering' : ''} ${className}`.trim()}
      data-cursor-text={cursorText}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={setPointerSpotlight}
      {...props}
    >
      {children}
    </a>
  );
}
