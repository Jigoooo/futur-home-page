import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cx } from './lib/cx';
import styles from './styles/legal-modal.module.css';

interface LegalModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

interface LegalModalHistoryState {
  legalModalKey?: string;
}

export function LegalModal({ open, title, onClose, children }: LegalModalProps) {
  const titleId = useId();
  const historyKeyRef = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [exitComplete, setExitComplete] = useState(!open);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rendered = open || (!reduceMotion && !exitComplete);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const key = `legal-modal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    historyKeyRef.current = key;
    window.history.pushState({ legalModalKey: key } satisfies LegalModalHistoryState, '');

    const handlePopState = () => {
      historyKeyRef.current = null;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      const currentState = window.history.state as LegalModalHistoryState | null;
      if (currentState?.legalModalKey === historyKeyRef.current) {
        historyKeyRef.current = null;
        window.history.back();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !rendered) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const page = document.querySelector<HTMLElement>('#landing-page-content');
    page?.setAttribute('inert', '');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        window.history.back();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        shellRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');

      if (focusable.length === 0) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', handleKeyDown);
      page?.removeAttribute('inert');
      previouslyFocused?.focus();
    };
  }, [open, rendered]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const html = document.documentElement;
    const wasCursorEnabled = html.dataset.landingCursorEnabled === 'true';
    if (wasCursorEnabled) {
      delete html.dataset.landingCursorEnabled;
    }

    return () => {
      if (wasCursorEnabled) {
        html.dataset.landingCursorEnabled = 'true';
      }
    };
  }, [open]);

  if (!rendered) {
    return null;
  }

  const handleClose = () => {
    window.history.back();
  };

  return createPortal(
    // Keep the explicit role for stable AT and legacy selector compatibility across dialog implementations.
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <dialog
      open
      className={styles.backdrop}
      data-state={open ? 'open' : 'closed'}
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      aria-hidden={!open}
      onAnimationStart={() => {
        if (open) setExitComplete(false);
      }}
      onAnimationEnd={(event) => {
        if (!open && event.currentTarget === event.target) setExitComplete(true);
      }}
    >
      <button
        type='button'
        className={styles.backdropButton}
        aria-label='개인정보 처리방침 닫기'
        data-legal-backdrop
        tabIndex={-1}
        onClick={handleClose}
      />
      <div ref={shellRef} className={styles.shell}>
        <header className={styles.head}>
          <strong id={titleId} className={styles.title}>
            {title}
          </strong>
          <button
            ref={closeButtonRef}
            type='button'
            className={cx(styles.closeButton)}
            onClick={handleClose}
            aria-label='닫기'
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}
