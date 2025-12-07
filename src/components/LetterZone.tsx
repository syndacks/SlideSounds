import { forwardRef, memo, type ForwardedRef } from 'react';

export type ZoneVisualState = 'inactive' | 'active' | 'complete';

interface LetterZoneProps {
  /** Letters to display */
  display: string;
  /** Accessibility label */
  label: string;
  /** Visual state */
  state: ZoneVisualState;
  /** Whether this is a multi-letter unit (digraph, blend) */
  isUnit?: boolean;
  /** Whether this is a stop consonant */
  isStop?: boolean;
  /** Whether this is a silent letter */
  isSilent?: boolean;
}

const STATE_LABEL: Record<ZoneVisualState, string> = {
  inactive: 'ready',
  active: 'now',
  complete: 'done',
};

const LetterZoneComponent = (
  { display, label, state, isUnit, isStop, isSilent }: LetterZoneProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  // Build class names based on props
  const classNames = [
    'letter-zone',
    `letter-zone--${state}`,
    isUnit ? 'letter-zone--unit' : '',
    isStop ? 'letter-zone--stop' : '',
    isSilent ? 'letter-zone--silent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} ref={ref}>
      <span className="letter-zone__text" aria-label={label}>
        {display.toUpperCase()}
      </span>
      <span className="letter-zone__status">
        {isSilent ? 'silent' : STATE_LABEL[state]}
      </span>
      {isStop && state === 'active' && (
        <span className="letter-zone__indicator">⚡</span>
      )}
    </div>
  );
};

const ForwardedLetterZone = forwardRef<HTMLDivElement, LetterZoneProps>(
  LetterZoneComponent,
);

ForwardedLetterZone.displayName = 'LetterZone';

export const LetterZone = memo(ForwardedLetterZone);
