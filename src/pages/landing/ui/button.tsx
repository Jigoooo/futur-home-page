import { type ComponentPropsWithoutRef } from 'react';

import { cx } from './lib/cx';
import styles from './styles/button.module.css';

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
  return (
    <a
      className={cx(styles.button, styles[variant], className)}
      data-landing-interactive='button'
      data-landing-spotlight='button'
      data-cursor-text={cursorText}
      {...props}
    >
      {children}
    </a>
  );
}
