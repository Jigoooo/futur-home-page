import { type ComponentPropsWithoutRef } from 'react';

import { cx } from './lib/cx';
import styles from './styles/button.module.css';

type ButtonVariant = 'primary' | 'blue' | 'ghost' | 'footer';

type ButtonProps = ComponentPropsWithoutRef<'a'> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <a
      className={cx(styles.button, styles[variant], className)}
      data-landing-interactive='button'
      data-landing-spotlight='button'
      data-button-variant={variant}
      {...props}
    >
      <span className={styles.liquidFill} data-button-liquid-fill aria-hidden='true' />
      <span className={styles.surface} data-landing-surface>
        {children}
      </span>
    </a>
  );
}
