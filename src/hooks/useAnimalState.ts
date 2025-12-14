import { useEffect, useState } from 'react';

export type AnimalAvatarState = 'sleeping' | 'stirring' | 'waking' | 'awake' | 'celebrating';

interface AnimalStateOptions {
  isCelebrating?: boolean;
}

const clampRatio = (ratio: number): number => {
  if (!Number.isFinite(ratio)) {
    return 0;
  }
  return Math.min(1, Math.max(0, ratio));
};

const stateFromRatio = (ratio: number): AnimalAvatarState => {
  if (ratio >= 0.7) return 'awake';
  if (ratio >= 0.3) return 'waking';
  if (ratio > 0.05) return 'stirring';
  return 'sleeping';
};

/**
 * Small hook that translates the scrub progress into an avatar state with a bit of smoothing.
 */
export const useAnimalState = (
  progressRatio: number,
  options: AnimalStateOptions = {},
): AnimalAvatarState => {
  const { isCelebrating = false } = options;
  const [state, setState] = useState<AnimalAvatarState>('sleeping');

  useEffect(() => {
    setState((current) => {
      if (isCelebrating) {
        return 'celebrating';
      }
      const nextState = stateFromRatio(clampRatio(progressRatio));
      return nextState === current ? current : nextState;
    });
  }, [progressRatio, isCelebrating]);

  return state;
};
