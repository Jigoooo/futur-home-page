import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

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
  const historyKeyRef = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);

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
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        window.history.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
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

  if (!open) {
    return null;
  }

  const handleClose = () => {
    window.history.back();
  };

  return (
    <div className={styles.backdrop} role='dialog' aria-modal='true' aria-label={title}>
      <button
        type='button'
        className={styles.backdropButton}
        aria-label='개인정보 처리방침 닫기'
        tabIndex={-1}
        onClick={handleClose}
      />
      <div className={styles.shell}>
        <header className={styles.head}>
          <strong className={styles.title}>{title}</strong>
          <button
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
    </div>
  );
}
