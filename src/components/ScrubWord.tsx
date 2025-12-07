import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { parseWordToPhonemes } from '../lib/wordParser';
import { WordDefinition } from '../types/phoneme';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { LetterZone, ZoneVisualState } from './LetterZone';

interface ZoneRect {
  startX: number;
  endX: number;
}

export const ScrubWord = ({ word }: { word: WordDefinition }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const zonesRef = useRef<ZoneRect[]>([]);
  const lastZoneRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [furthestCompleted, setFurthestCompleted] = useState(-1);
  const [progressRatio, setProgressRatio] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { units, missingGraphemes } = useMemo(
    () => parseWordToPhonemes(word.text),
    [word.text],
  );

  const totalZones = units.length;
  const activeUnit = activeIndex !== null ? units[activeIndex] : null;
  const progressPercent = Math.round(progressRatio * 100);

  const { preloadPhonemes, playPhoneme, resume } = useAudioEngine();

  useEffect(() => {
    if (missingGraphemes.length > 0) {
      setError(
        `Missing phoneme audio for: ${missingGraphemes
          .map((g) => g.toUpperCase())
          .join(', ')}`,
      );
      return;
    }
    setError(null);
    if (units.length === 0) {
      setError('No playable phonemes');
      return;
    }
    preloadPhonemes(units).catch((err) =>
      setError(`Failed to preload audio: ${err.message}`),
    );
  }, [missingGraphemes, preloadPhonemes, units]);

  useEffect(() => {
    setActiveIndex(null);
    setFurthestCompleted(-1);
    setProgressRatio(0);
  }, [word.id]);

  useEffect(() => {
    letterRefs.current = Array(units.length).fill(null);
  }, [units.length]);

  const calculateZones = useCallback(() => {
    zonesRef.current = letterRefs.current
      .map((ref): ZoneRect | null => {
        if (!ref) {
          return null;
        }
        const rect = ref.getBoundingClientRect();
        return {
          startX: rect.left,
          endX: rect.right,
        };
      })
      .filter((zone): zone is ZoneRect => zone !== null);
  }, [units]);

  const findZoneIndexAtX = useCallback((x: number): number | null => {
    const zones = zonesRef.current;
    for (let i = 0; i < zones.length; i += 1) {
      const zone = zones[i];
      if (x >= zone.startX && x <= zone.endX) {
        return i;
      }
    }
    return null;
  }, []);

  const updateProgressFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const width = rect.width || 1;
    const ratio = (clientX - rect.left) / width;
    const clamped = Math.min(1, Math.max(0, ratio));
    setProgressRatio(clamped);
  }, []);

  const handleZoneChange = useCallback(
    (zoneIndex: number | null) => {
      if (zoneIndex === null) {
        lastZoneRef.current = null;
        setActiveIndex(null);
        return;
      }

      if (zoneIndex === lastZoneRef.current) {
        return;
      }

      const nextUnit = units[zoneIndex];
      if (nextUnit) {
        void playPhoneme(nextUnit);
      }
      lastZoneRef.current = zoneIndex;
      setActiveIndex(zoneIndex);
      setFurthestCompleted((current) => Math.max(current, zoneIndex - 1));
    },
    [playPhoneme, units],
  );

  const handlePositionChange = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) {
        return;
      }
      updateProgressFromClientX(clientX);
      const zoneIndex = findZoneIndexAtX(clientX);
      handleZoneChange(zoneIndex);
    },
    [findZoneIndexAtX, handleZoneChange, updateProgressFromClientX],
  );

  const handleInteractionStart = useCallback(
    (clientX: number) => {
      void resume();
      calculateZones();
      isDraggingRef.current = true;
      setIsScrubbing(true);
      handlePositionChange(clientX);
    },
    [calculateZones, handlePositionChange, resume],
  );

  const handleInteractionEnd = useCallback(() => {
    if (!isDraggingRef.current) {
      return;
    }
    const lastZone = lastZoneRef.current;
    isDraggingRef.current = false;
    lastZoneRef.current = null;
    setIsScrubbing(false);
    setProgressRatio(0);
    if (typeof lastZone === 'number') {
      setFurthestCompleted((current) => Math.max(current, lastZone));
    }
    setActiveIndex(null);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    calculateZones();

    const supportsPointer = 'onpointerdown' in window;

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      container.setPointerCapture?.(event.pointerId);
      handleInteractionStart(event.clientX);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }
      event.preventDefault();
      handlePositionChange(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent) => {
      container.releasePointerCapture?.(event.pointerId);
      event.preventDefault();
      handleInteractionEnd();
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      handleInteractionStart(touch.clientX);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDraggingRef.current) {
        return;
      }
      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      handlePositionChange(touch.clientX);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      handleInteractionEnd();
    };

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      handleInteractionStart(event.clientX);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) {
        return;
      }
      handlePositionChange(event.clientX);
    };

    const handleMouseUp = () => {
      handleInteractionEnd();
    };

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

    const handleResize = () => {
      calculateZones();
    };
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

  const zoneStates = useMemo(
    () =>
      units.map<ZoneVisualState>((_, index) => {
        if (index <= furthestCompleted) {
          return 'complete';
        }
        if (index === activeIndex) {
          return 'active';
        }
        return 'inactive';
      }),
    [activeIndex, furthestCompleted, units],
  );

  const promptText = useMemo(() => {
    if (isScrubbing && activeUnit) {
      return `Blend the "${activeUnit.grapheme.toUpperCase()}" sound.`;
    }
    if (isScrubbing) {
      return 'Stay on the word to keep the sound flowing.';
    }
    return 'Press and slide across every letter to wake the word.';
  }, [activeUnit, isScrubbing]);

  return (
    <div className="scrub-word-container">
      <div className="scrub-word__instruction-row">
        <p className="scrub-word__instruction">Slide to blend every sound.</p>
        <span
          className={`scrub-word__status ${
            isScrubbing ? 'scrub-word__status--active' : ''
          }`}
        >
          {isScrubbing ? 'Scrubbing…' : 'Press & hold'}
        </span>
      </div>
      {error && <div className="scrub-word__error">{error}</div>}
      <div
        className="scrub-word"
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
      <div className="scrub-word__track-wrapper" aria-hidden="true">
        <div className="scrub-word__track">
          <div
            className="scrub-word__track-fill"
            style={{ width: `${progressRatio * 100}%` }}
          />
          <div className="scrub-word__track-markers">
            {units.map((unit, index) => (
              <span
                key={`${unit.id}-marker`}
                className="scrub-word__track-marker"
                style={{
                  left:
                    totalZones <= 1
                      ? '0%'
                      : `${(index / (totalZones - 1)) * 100}%`,
                }}
              />
            ))}
          </div>
          <div
            className={`scrub-word__track-indicator ${
              isScrubbing ? 'is-active' : ''
            }`}
            style={{ left: `${progressRatio * 100}%` }}
          />
        </div>
      </div>
      <div className="scrub-word__prompt">
        <p>{promptText}</p>
        <span className="scrub-word__percent">{progressPercent}%</span>
      </div>
    </div>
  );
};
