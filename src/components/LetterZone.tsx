import { forwardRef, memo, type ForwardedRef } from 'react';

export type ZoneVisualState = 'waiting' | 'active' | 'done';

interface LetterZoneProps {
  /** Letters to display */
  display: string;
  /** Accessibility label */
  label: string;
  /** Visual state */
  state: ZoneVisualState;
}

const LetterZoneComponent = (
  { display, label, state }: LetterZoneProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  return (
    <div className={`letter-zone letter-zone--${state}`} ref={ref}>
      <span className="letter-zone__text" aria-label={label}>
        {display.toUpperCase()}
      </span>
      {state === 'done' && (
        <span className="letter-zone__check" aria-hidden="true">✓</span>
      )}
    </div>
  );
};

const ForwardedLetterZone = forwardRef<HTMLDivElement, LetterZoneProps>(
  LetterZoneComponent,
);

ForwardedLetterZone.displayName = 'LetterZone';

export const LetterZone = memo(ForwardedLetterZone);
