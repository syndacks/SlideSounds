import { forwardRef, memo, type ForwardedRef } from 'react';

export type ZoneVisualState = 'inactive' | 'active' | 'complete';

interface LetterZoneProps {
  display: string;
  label: string;
  state: ZoneVisualState;
}

const STATE_LABEL: Record<ZoneVisualState, string> = {
  inactive: 'ready',
  active: 'now',
  complete: 'done',
};

const LetterZoneComponent = (
  { display, label, state }: LetterZoneProps,
  ref: ForwardedRef<HTMLDivElement>,
) => (
  <div className={`letter-zone letter-zone--${state}`} ref={ref}>
    <span className="letter-zone__text" aria-label={label}>
      {display.toUpperCase()}
    </span>
    <span className="letter-zone__status">{STATE_LABEL[state]}</span>
  </div>
);

const ForwardedLetterZone = forwardRef<HTMLDivElement, LetterZoneProps>(
  LetterZoneComponent,
);

ForwardedLetterZone.displayName = 'LetterZone';

export const LetterZone = memo(ForwardedLetterZone);
