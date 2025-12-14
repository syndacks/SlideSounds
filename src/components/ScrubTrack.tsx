import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PhonemeCategory } from '../types/phoneme';

type LetterColorType = 'vowel' | 'consonant' | 'default';

/**
 * Maps phoneme categories to visual color types
 */
const getCategoryColorType = (category?: PhonemeCategory): LetterColorType => {
  if (!category) return 'default';
  switch (category) {
    case 'short_vowel':
    case 'long_vowel':
    case 'vowel_team':
    case 'r_controlled':
      return 'vowel';
    case 'continuous_consonant':
    case 'stop_consonant':
    case 'digraph':
    case 'blend':
      return 'consonant';
    case 'welded':
      // Welded sounds are vowel-consonant combos, color as vowel since vowel is the anchor
      return 'vowel';
    case 'silent':
      return 'default';
    default:
      return 'default';
  }
};

interface ScrubTrackProps {
  letters: string[];
  letterCategories?: PhonemeCategory[];
  letterPositions?: number[];
  onScrubStart?: () => void;
  onScrubMove?: (ratio: number) => void;
  onScrubEnd?: (ratio: number) => void;
}

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

const TAP_DISTANCE_PX = 14;
const AUTO_ADVANCE_DELAY_MS = 700;

/**
 * Visual-only scrubbing track that exposes normalized progress updates.
 * This component focuses purely on gesture capture + presentation; audio is handled upstream.
 */
export const ScrubTrack = ({
  letters,
  letterCategories,
  letterPositions,
  onScrubStart,
  onScrubMove,
  onScrubEnd,
}: ScrubTrackProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const isPointerActiveRef = useRef(false);
  const dragStartXRef = useRef(0);
  const maxDeltaRef = useRef(0);
  const miniScrubTimeoutsRef = useRef<number[]>([]);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const [visualProgress, setVisualProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Edge-to-edge positioning: first letter at 0%, last at 100%
  const anchorPositions = useMemo(() => {
    if (letterPositions && letterPositions.length === letters.length) {
      return letterPositions.map((pos) => clampRatio(pos));
    }
    if (letters.length === 0) return [];
    if (letters.length === 1) return [0.5];
    // First letter at 0, last at 1, evenly distributed
    return letters.map((_, index) => index / (letters.length - 1));
  }, [letterPositions, letters]);

  const clearMiniScrubTimeouts = useCallback(() => {
    miniScrubTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    miniScrubTimeoutsRef.current = [];
  }, []);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearAutoAdvance();
  }, [anchorPositions, clearAutoAdvance]);

  const scheduleAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }
    const step = () => {
      setVisualProgress((current) => {
        const target = targetProgressRef.current;
        const diff = target - current;
        if (Math.abs(diff) <= 0.002) {
          rafRef.current = null;
          return target;
        }
        const eased = current + diff * 0.25;
        rafRef.current = window.requestAnimationFrame(step);
        return eased;
      });
    };
    rafRef.current = window.requestAnimationFrame(step);
  }, []);

  const setVisualTarget = useCallback(
    (ratio: number, immediate: boolean = false) => {
      const clamped = clampRatio(ratio);
      targetProgressRef.current = clamped;
      if (immediate) {
        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setVisualProgress(clamped);
        return;
      }
      scheduleAnimation();
    },
    [scheduleAnimation],
  );

  const emitProgress = useCallback(
    (ratio: number, options?: { immediate?: boolean }) => {
      const clamped = clampRatio(ratio);
      onScrubMove?.(clamped);
      setVisualTarget(clamped, options?.immediate ?? false);
      return clamped;
    },
    [onScrubMove, setVisualTarget],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      clearMiniScrubTimeouts();
      clearAutoAdvance();
    };
  }, [clearAutoAdvance, clearMiniScrubTimeouts]);

  const ratioFromClientX = useCallback((clientX: number): number => {
    const trackEl = trackRef.current;
    if (!trackEl) {
      return 0;
    }
    const rect = trackEl.getBoundingClientRect();
    if (rect.width <= 0) {
      return 0;
    }
    const relative = (clientX - rect.left) / rect.width;
    return clampRatio(relative);
  }, []);

  const nearestAnchorIndex = useCallback(
    (ratio: number): number | null => {
      if (anchorPositions.length === 0) {
        return null;
      }
      let closestIndex = 0;
      let minDistance = Math.abs(ratio - anchorPositions[0]);
      for (let i = 1; i < anchorPositions.length; i++) {
        const candidate = anchorPositions[i];
        const distance = Math.abs(ratio - candidate);
        if (distance < minDistance) {
          closestIndex = i;
          minDistance = distance;
        }
      }
      return closestIndex;
    },
    [anchorPositions],
  );

  const runMiniScrubVisual = useCallback(
    (centerRatio: number) => {
      clearMiniScrubTimeouts();
      const forward = window.setTimeout(() => {
        setVisualTarget(clampRatio(centerRatio + 0.015));
      }, 60);
      const backward = window.setTimeout(() => {
        setVisualTarget(clampRatio(centerRatio - 0.01));
      }, 140);
      const settle = window.setTimeout(() => {
        setVisualTarget(centerRatio);
      }, 240);
      miniScrubTimeoutsRef.current = [forward, backward, settle];
    },
    [clearMiniScrubTimeouts, setVisualTarget],
  );

  const scheduleAutoAdvance = useCallback(
    (originRatio: number) => {
      clearAutoAdvance();
      if (anchorPositions.length <= 1) {
        return;
      }
      const originIndex = nearestAnchorIndex(originRatio);
      if (originIndex === null) {
        return;
      }
      const nextIndex = originIndex + 1;
      if (nextIndex >= anchorPositions.length) {
        return;
      }
      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        autoAdvanceTimeoutRef.current = null;
        const nextRatio = anchorPositions[nextIndex];
        if (typeof nextRatio === 'number') {
          setVisualTarget(nextRatio);
        }
      }, AUTO_ADVANCE_DELAY_MS);
    },
    [anchorPositions, clearAutoAdvance, nearestAnchorIndex, setVisualTarget],
  );

  const handleTap = useCallback(
    (clientX: number | null) => {
      const ratio = clientX !== null ? ratioFromClientX(clientX) : targetProgressRef.current;
      const anchorIndex = nearestAnchorIndex(ratio);
      const anchorRatio =
        anchorIndex !== null && typeof anchorPositions[anchorIndex] === 'number'
          ? anchorPositions[anchorIndex]
          : ratio;
      const snappedRatio = emitProgress(anchorRatio, { immediate: true });
      onScrubEnd?.(snappedRatio);
      runMiniScrubVisual(snappedRatio);
      scheduleAutoAdvance(snappedRatio);
    },
    [
      anchorPositions,
      emitProgress,
      nearestAnchorIndex,
      onScrubEnd,
      ratioFromClientX,
      runMiniScrubVisual,
      scheduleAutoAdvance,
    ],
  );

  const finishScrub = useCallback(
    (clientX: number | null) => {
      if (!isPointerActiveRef.current) {
        return;
      }
      isPointerActiveRef.current = false;
      const distance = maxDeltaRef.current;
      maxDeltaRef.current = 0;
      const shouldTreatAsTap = distance < TAP_DISTANCE_PX;

      if (shouldTreatAsTap) {
        handleTap(clientX);
        return;
      }

      const ratio = clientX !== null ? ratioFromClientX(clientX) : targetProgressRef.current;
      const finalRatio = emitProgress(ratio);
      onScrubEnd?.(finalRatio);
      scheduleAutoAdvance(finalRatio);
    },
    [emitProgress, handleTap, onScrubEnd, ratioFromClientX, scheduleAutoAdvance],
  );

  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      trackEl.setPointerCapture?.(event.pointerId);
      pointerIdRef.current = event.pointerId;
      isPointerActiveRef.current = true;
      dragStartXRef.current = event.clientX;
      maxDeltaRef.current = 0;
      clearMiniScrubTimeouts();
      clearAutoAdvance();
      onScrubStart?.();
      emitProgress(ratioFromClientX(event.clientX), { immediate: true });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerActiveRef.current || pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      const delta = Math.abs(event.clientX - dragStartXRef.current);
      if (delta > maxDeltaRef.current) {
        maxDeltaRef.current = delta;
      }
      clearAutoAdvance();
      emitProgress(ratioFromClientX(event.clientX));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      trackEl.releasePointerCapture?.(event.pointerId);
      finishScrub(event.clientX);
      pointerIdRef.current = null;
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      trackEl.releasePointerCapture?.(event.pointerId);
      finishScrub(null);
      pointerIdRef.current = null;
    };

    trackEl.addEventListener('pointerdown', handlePointerDown, { passive: false });
    trackEl.addEventListener('pointermove', handlePointerMove, { passive: false });
    trackEl.addEventListener('pointerup', handlePointerUp, { passive: false });
    trackEl.addEventListener('pointercancel', handlePointerCancel, {
      passive: false,
    });

    return () => {
      trackEl.removeEventListener('pointerdown', handlePointerDown);
      trackEl.removeEventListener('pointermove', handlePointerMove);
      trackEl.removeEventListener('pointerup', handlePointerUp);
      trackEl.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [
    clearAutoAdvance,
    clearMiniScrubTimeouts,
    emitProgress,
    finishScrub,
    onScrubStart,
    ratioFromClientX,
  ]);

  // Determine which letter is currently active based on handle position
  const activeLetterIndex = useMemo(() => {
    if (letters.length === 0) return -1;
    if (letters.length === 1) return 0;
    const index = nearestAnchorIndex(visualProgress);
    return index === null ? -1 : index;
  }, [letters.length, nearestAnchorIndex, visualProgress]);

  return (
    <div
      className="scrub-track"
      ref={trackRef}
      role="slider"
      aria-label="Word scrub timeline"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={visualProgress}
    >
      <div className="scrub-track__labels">
        {letters.map((letter, index) => {
          const colorType = getCategoryColorType(letterCategories?.[index]);
          const isActive = index === activeLetterIndex;
          return (
            <div
              key={`${letter}-${index}`}
              className={`scrub-track__label scrub-track__label--${colorType}${isActive ? ' scrub-track__label--active' : ''}`}
              style={{ left: `${anchorPositions[index] * 100}%` }}
            >
              {letter}
            </div>
          );
        })}
      </div>
      <div className="scrub-track__rail">
        <div
          className="scrub-track__fill"
          style={{ width: `${visualProgress * 100}%` }}
          aria-hidden="true"
        />
        <div
          className="scrub-track__handle"
          style={{ left: `${visualProgress * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
