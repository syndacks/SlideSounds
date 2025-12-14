import { useEffect, useRef } from 'react';

interface ResetProgressDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetProgressDialog = ({
  isOpen,
  onCancel,
  onConfirm,
}: ResetProgressDialogProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    cancelButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="reset-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
      <div className="reset-dialog__backdrop" aria-hidden="true" onClick={onCancel} />
      <div className="reset-dialog__card">
        <h2 id="reset-dialog-title">Reset progress?</h2>
        <p className="reset-dialog__body">
          This clears every animal&apos;s words and starts the adventure over. This can&apos;t be
          undone.
        </p>
        <div className="reset-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="reset-dialog__button reset-dialog__button--ghost"
            onClick={onCancel}
          >
            Keep Playing
          </button>
          <button
            type="button"
            className="reset-dialog__button reset-dialog__button--danger"
            onClick={onConfirm}
          >
            🔄 Reset Adventure
          </button>
        </div>
      </div>
    </div>
  );
};
