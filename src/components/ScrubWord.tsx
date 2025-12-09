import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { parseWordToPhonemes } from '../lib/wordParser';
import { WordDefinition } from '../types/phoneme';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { LetterZone, ZoneVisualState } from './LetterZone';

interface ZoneRect {
  startX: number;
  endX: number;
}

interface ScrubWordProps {
  word: WordDefinition;
  onComplete?: () => void;
  onProgressChange?: (ratio: number) => void;
  onInteractionStart?: () => void;
  isWordAudioReady?: boolean;
}

export const ScrubWord = ({
  word,
  onComplete,
  onProgressChange,
  onInteractionStart,
  isWordAudioReady = true,
}: ScrubWordProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const zonesRef = useRef<ZoneRect[]>([]);
  const lastZoneRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const stopPlayedRef = useRef<Set<number>>(new Set());
  const pendingCompletionRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [furthestCompleted, setFurthestCompleted] = useState(-1);
  const [progressRatio, setProgressRatio] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);

  // Parse the word into phoneme units
  const parsed = useMemo(() => parseWordToPhonemes(word.text), [word.text]);
  const { units } = parsed;

  const totalZones = units.length;

  const { preloadPhonemes, playPhoneme, stopAll, resetLastPlayed, resume } =
    useAudioEngine();

  // Preload audio on mount or word change
  useEffect(() => {
    const playableUnits = units.filter((u) => u.audioFile);
    if (playableUnits.length > 0) {
      preloadPhonemes(playableUnits).catch(console.error);
    }
  }, [preloadPhonemes, units]);

  // Reset state when word changes
  useEffect(() => {
    setActiveIndex(null);
    setFurthestCompleted(-1);
    setProgressRatio(0);
    setHasCompletedOnce(false);
    stopPlayedRef.current.clear();
    resetLastPlayed();
    pendingCompletionRef.current = false;
  }, [word.id, resetLastPlayed]);

  // Initialize letter refs
  useEffect(() => {
    letterRefs.current = Array(units.length).fill(null);
  }, [units.length]);

  // Calculate zone boundaries from letter element positions
  const calculateZones = useCallback(() => {
    zonesRef.current = letterRefs.current
      .map((ref): ZoneRect | null => {
        if (!ref) return null;
        const rect = ref.getBoundingClientRect();
        return { startX: rect.left, endX: rect.right };
      })
      .filter((zone): zone is ZoneRect => zone !== null);
  }, []);

  // Find which zone contains the given X coordinate
  const findZoneIndexAtX = useCallback((x: number): number | null => {
    const zones = zonesRef.current;
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      if (x >= zone.startX && x <= zone.endX) {
        return i;
      }
    }
    return null;
  }, []);

  // Update progress ratio based on finger position
  const updateProgressFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 1;
    const ratio = (clientX - rect.left) / width;
    const clamped = Math.min(1, Math.max(0, ratio));
    setProgressRatio(clamped);
  }, []);

  // Handle zone change - play phoneme when entering a new zone
  const handleZoneChange = useCallback(
    (zoneIndex: number | null) => {
      if (zoneIndex === null) {
        lastZoneRef.current = null;
        setActiveIndex(null);
        return;
      }

      // Same zone - don't replay
      if (zoneIndex === lastZoneRef.current) {
        return;
      }

      const nextUnit = units[zoneIndex];
      if (!nextUnit) return;

      // Handle stop consonants specially
      if (nextUnit.isStop) {
        // Only play stops once per scrub session
        if (!stopPlayedRef.current.has(zoneIndex)) {
          void playPhoneme(nextUnit, { crossfade: false });
          stopPlayedRef.current.add(zoneIndex);
        }
      } else if (!nextUnit.isSilent && nextUnit.audioFile) {
        // Continuous sound - play with crossfade
        void playPhoneme(nextUnit, { crossfade: true });
      }

      lastZoneRef.current = zoneIndex;
      setActiveIndex(zoneIndex);
      setFurthestCompleted((current) => Math.max(current, zoneIndex - 1));
    },
    [playPhoneme, units],
  );

  // Handle position change during drag
  const handlePositionChange = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) return;
      updateProgressFromClientX(clientX);
      const zoneIndex = findZoneIndexAtX(clientX);
      handleZoneChange(zoneIndex);
    },
    [findZoneIndexAtX, handleZoneChange, updateProgressFromClientX],
  );

  // Start interaction
  const handleInteractionStart = useCallback(
    (clientX: number) => {
      onInteractionStart?.();
      void resume();
      calculateZones();
      isDraggingRef.current = true;
      stopPlayedRef.current.clear();
      setIsScrubbing(true);
      handlePositionChange(clientX);
    },
    [calculateZones, handlePositionChange, onInteractionStart, resume],
  );

  // End interaction
  const handleInteractionEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    const lastZone = lastZoneRef.current;
    const completedIndex = Math.max(
      furthestCompleted,
      typeof lastZone === 'number' ? lastZone : -1,
    );

    // Check if user completed the word (got to 80%+ and touched last zone)
    const didCompleteWord =
      totalZones > 0 && completedIndex >= totalZones - 1 && progressRatio > 0.8;

    // Stop any playing sounds
    stopAll(100);

    // Reset state
    isDraggingRef.current = false;
    lastZoneRef.current = null;
    stopPlayedRef.current.clear();
    setIsScrubbing(false);
    setProgressRatio(0);

    if (typeof lastZone === 'number') {
      setFurthestCompleted((current) => Math.max(current, lastZone));
    }
    setActiveIndex(null);
    resetLastPlayed();

    // Report completion when word audio is ready
    if (didCompleteWord) {
      if (isWordAudioReady) {
        pendingCompletionRef.current = false;
        setHasCompletedOnce(true);
        onComplete?.();
      } else {
        pendingCompletionRef.current = true;
      }
    }
  }, [
    furthestCompleted,
    isWordAudioReady,
    progressRatio,
    totalZones,
    stopAll,
    resetLastPlayed,
    onComplete,
  ]);

  // If the learner already completed the scrub while audio was still loading,
  // automatically fire completion once the word audio becomes ready.
  useEffect(() => {
    if (!isWordAudioReady || !pendingCompletionRef.current) {
      return;
    }
    pendingCompletionRef.current = false;
    setHasCompletedOnce(true);
    onComplete?.();
  }, [isWordAudioReady, onComplete]);

  useEffect(() => {
    onProgressChange?.(progressRatio);
  }, [onProgressChange, progressRatio]);

  // Set up event listeners
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    calculateZones();

    const supportsPointer = 'onpointerdown' in window;

    // Pointer events (preferred)
    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      container.setPointerCapture?.(event.pointerId);
      handleInteractionStart(event.clientX);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;
      event.preventDefault();
      handlePositionChange(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent) => {
      container.releasePointerCapture?.(event.pointerId);
      event.preventDefault();
      handleInteractionEnd();
    };

    // Touch events (fallback)
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) return;
      handleInteractionStart(touch.clientX);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDraggingRef.current) return;
      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) return;
      handlePositionChange(touch.clientX);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      handleInteractionEnd();
    };

    // Mouse events (fallback)
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      handleInteractionStart(event.clientX);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      handlePositionChange(event.clientX);
    };

    const handleMouseUp = () => {
      handleInteractionEnd();
    };

    // Attach listeners
    if (supportsPointer) {
      container.addEventListener('pointerdown', handlePointerDown, {
        passive: false,
      });
      container.addEventListener('pointermove', handlePointerMove, {
        passive: false,
      });
      container.addEventListener('pointerup', handlePointerUp, {
        passive: false,
      });
      container.addEventListener('pointercancel', handlePointerUp, {
        passive: false,
      });
    } else {
      container.addEventListener('touchstart', handleTouchStart, {
        passive: false,
      });
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      container.addEventListener('touchend', handleTouchEnd, {
        passive: false,
      });
      container.addEventListener('touchcancel', handleTouchEnd, {
        passive: false,
      });
      container.addEventListener('mousedown', handleMouseDown, {
        passive: false,
      });
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
    }

    const handleResize = () => calculateZones();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (supportsPointer) {
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('pointercancel', handlePointerUp);
      } else {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [
    calculateZones,
    handleInteractionEnd,
    handleInteractionStart,
    handlePositionChange,
  ]);

  // Compute visual states for each zone - simplified to 3 states
  const zoneStates = useMemo(
    () =>
      units.map<ZoneVisualState>((_unit, index) => {
        if (index === activeIndex) return 'active';
        if (index <= furthestCompleted) return 'done';
        return 'waiting';
      }),
    [activeIndex, furthestCompleted, units],
  );

  return (
    <div className="scrub-word-wrapper">
      <div
        className={`scrub-word ${hasCompletedOnce ? 'scrub-word--complete' : ''} ${isScrubbing ? 'scrub-word--scrubbing' : ''}`}
        ref={containerRef}
        role="group"
        aria-label={`Scrubbable word ${word.displayText ?? word.text}`}
      >
        {units.map((unit, index) => (
          <LetterZone
            key={unit.id}
            display={unit.grapheme}
            label={unit.label}
            state={zoneStates[index]}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
          />
        ))}
      </div>

      {/* Simple swipe hint - just an animated hand */}
      {!isScrubbing && !hasCompletedOnce && (
        <div className="scrub-word__hint" aria-hidden="true">
          <span className="scrub-word__hint-hand">👆</span>
          <span className="scrub-word__hint-arrow">→</span>
        </div>
      )}
    </div>
  );
};
