import React, { useEffect, useRef } from 'react';
import './Modal.css';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousActiveElement.current?.focus();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            className="modal-close"
          >
            ×
          </Button>
        </div>
        <div className="modal-content">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

