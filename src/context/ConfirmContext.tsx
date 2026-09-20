'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, CheckCircle2, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  icon?: 'trash' | 'alert' | 'help' | 'check';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [isClosing, setIsClosing] = useState(false);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  const confirm = useCallback((opts: ConfirmOptions | string) => {
    const normalizedOpts: ConfirmOptions =
      typeof opts === 'string'
        ? { message: opts, title: 'Confirm Action', isDanger: true }
        : {
            title: opts.title || (opts.isDanger ? 'Confirm Deletion' : 'Confirm Action'),
            confirmText: opts.confirmText || (opts.isDanger ? 'Yes, Delete' : 'Yes, Confirm'),
            cancelText: opts.cancelText || 'No, Cancel',
            isDanger: opts.isDanger !== undefined ? opts.isDanger : true,
            icon: opts.icon || (opts.isDanger ? 'trash' : 'alert'),
            ...opts,
          };

    setOptions(normalizedOpts);
    setIsOpen(true);
    setIsClosing(false);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (resolverRef.current) {
        resolverRef.current(confirmed);
        resolverRef.current = null;
      }
    }, 180);
  };

  // Keyboard accessibility: ESC to cancel, Enter to confirm
  useEffect(() => {
    if (!isOpen) return;

    // Focus confirm button when opened
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const renderIcon = () => {
    const size = 26;
    if (options.icon === 'trash') {
      return <Trash2 size={size} />;
    }
    if (options.icon === 'check') {
      return <CheckCircle2 size={size} />;
    }
    if (options.icon === 'help') {
      return <HelpCircle size={size} />;
    }
    return <AlertTriangle size={size} />;
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div
          className={`confirm-modal-overlay ${isClosing ? 'closing' : 'opening'}`}
          onClick={() => handleClose(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
        >
          <div
            className={`confirm-modal-container ${options.isDanger ? 'danger-mode' : 'gold-mode'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Cross Button */}
            <button
              type="button"
              className="confirm-modal-close-btn"
              onClick={() => handleClose(false)}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Sacred / Alert Icon Circle */}
            <div className={`confirm-icon-box ${options.isDanger ? 'danger' : 'gold'}`}>
              {renderIcon()}
            </div>

            {/* Title */}
            <h3 id="confirm-modal-title" className="confirm-modal-title">
              {options.title || 'Confirm Action'}
            </h3>

            {/* Main Message */}
            <p id="confirm-modal-desc" className="confirm-modal-message">
              {options.message}
            </p>

            {/* Optional Description / Sub-note */}
            {options.description && (
              <p className="confirm-modal-desc-sub">{options.description}</p>
            )}

            {/* Actions Row: No (Cancel) & Yes (Confirm) */}
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-btn confirm-btn-cancel"
                onClick={() => handleClose(false)}
              >
                <span>{options.cancelText || 'No, Cancel'}</span>
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                className={`confirm-btn confirm-btn-submit ${options.isDanger ? 'danger' : 'gold'}`}
                onClick={() => handleClose(true)}
              >
                <span>{options.confirmText || (options.isDanger ? 'Yes, Delete' : 'Yes, Confirm')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}
