import { memo } from 'react';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export const TutorialOverlay = memo(({ onDismiss }: TutorialOverlayProps) => {
  return (
    <div className="tutorial-overlay">
      <button
        type="button"
        className="tutorial-overlay__content"
        onClick={onDismiss}
        aria-label="Dismiss tutorial overlay"
      >
        <span className="tutorial-overlay__hand" aria-hidden="true">
          👆
        </span>
        <p className="tutorial-overlay__text">Press and slide across the letters!</p>
        <div className="tutorial-overlay__arrow" aria-hidden="true" />
      </button>
    </div>
  );
});

TutorialOverlay.displayName = 'TutorialOverlay';
