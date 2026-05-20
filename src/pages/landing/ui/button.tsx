import { type ComponentPropsWithoutRef } from 'react';

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
      className={`btn btn-${variant} ${className}`.trim()}
      data-cursor-text={cursorText}
      {...props}
    >
      {children}
    </a>
  );
}
