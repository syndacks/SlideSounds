import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { usePhonemeAudio } from '../hooks/usePhonemeAudio';
import { PhonemeZone } from '../types/phoneme';

interface PhonicsWordProps {
  word: string;
}

export const PhonicsWord: React.FC<PhonicsWordProps> = ({ word }) => {
  const { isLoaded, playPhoneme, ensureContextResumed } = usePhonemeAudio();
  const [activeLetter, setActiveLetter] = useState<number | null>(null);
  
  // Use refs for high-frequency tracking to avoid React re-render latency
  const isDraggingRef = useRef(false);
  const lastPlayedIndexRef = useRef<number | null>(null);
  const zonesRef = useRef<PhonemeZone[]>([]);
  const letterRefsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const letters = word.toLowerCase().split('');

  // Reset tracking state when word changes (runs synchronously during render)
  const prevWordRef = useRef(word);
  if (prevWordRef.current !== word) {
    prevWordRef.current = word;
    // Reset tracking refs - the letter refs will be repopulated by React during this render
    zonesRef.current = [];
    lastPlayedIndexRef.current = null;
    // Reset active letter state
    if (activeLetter !== null) {
      // Use a microtask to avoid setState during render
      queueMicrotask(() => setActiveLetter(null));
    }
  }

  // Calculate zones and cache in ref
  const calculateZones = useCallback(() => {
    const newZones: PhonemeZone[] = [];

    letterRefsRef.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        newZones.push({
          letter: letters[index],
          startX: rect.left,
          endX: rect.right,
          phoneme: letters[index],
        });
      }
    });

    zonesRef.current = newZones;
  }, [letters]);

  // Find zone at X position - returns index or -1
  const findZoneIndexAtX = useCallback((x: number): number => {
    const zones = zonesRef.current;
    for (let i = 0; i < zones.length; i++) {
      if (x >= zones[i].startX && x <= zones[i].endX) {
        return i;
      }
    }
    return -1;
  }, []);

  // Handle position change - core logic for playing sounds
  const handlePositionChange = useCallback((x: number) => {
    if (!isDraggingRef.current) return;

    const zoneIndex = findZoneIndexAtX(x);

    if (zoneIndex !== -1 && zoneIndex !== lastPlayedIndexRef.current) {
      const zone = zonesRef.current[zoneIndex];
      playPhoneme(zone.letter);
      lastPlayedIndexRef.current = zoneIndex;
      setActiveLetter(zoneIndex);
    } else if (zoneIndex === -1) {
      // Finger moved outside all zones
      lastPlayedIndexRef.current = null;
      setActiveLetter(null);
    }
  }, [findZoneIndexAtX, playPhoneme]);

  // Start interaction - plays sound immediately at position
  const handleInteractionStart = useCallback((x: number) => {
    // Ensure AudioContext is running (needed for mobile)
    ensureContextResumed();
    
    // Recalculate zones in case layout changed
    calculateZones();

    isDraggingRef.current = true;
    lastPlayedIndexRef.current = null;

    // Immediately play sound at the starting position
    const zoneIndex = findZoneIndexAtX(x);
    if (zoneIndex !== -1) {
      const zone = zonesRef.current[zoneIndex];
      playPhoneme(zone.letter);
      lastPlayedIndexRef.current = zoneIndex;
      setActiveLetter(zoneIndex);
    }
  }, [calculateZones, ensureContextResumed, findZoneIndexAtX, playPhoneme]);

  // End interaction
  const handleInteractionEnd = useCallback(() => {
    isDraggingRef.current = false;
    lastPlayedIndexRef.current = null;
    setActiveLetter(null);
    // Let the current sound play out naturally (don't stop it abruptly)
  }, []);

  // Set up native event listeners for maximum responsiveness
  // Using useLayoutEffect to ensure listeners are updated before user can interact
  useLayoutEffect(() => {
    if (!isLoaded) return;

    const container = containerRef.current;
    if (!container) return;

    // Calculate initial zones
    calculateZones();

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling and other defaults
      if (e.touches.length > 0) {
        handleInteractionStart(e.touches[0].clientX);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handlePositionChange(e.touches[0].clientX);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleInteractionEnd();
    };

    const onTouchCancel = (e: TouchEvent) => {
      e.preventDefault();
      handleInteractionEnd();
    };

    // Mouse events (for desktop)
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleInteractionStart(e.clientX);
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePositionChange(e.clientX);
    };

    const onMouseUp = () => {
      handleInteractionEnd();
    };

    const onMouseLeave = () => {
      handleInteractionEnd();
    };

    // Pointer events (unified, if available)
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      handleInteractionStart(e.clientX);
    };

    const onPointerMove = (e: PointerEvent) => {
      handlePositionChange(e.clientX);
    };

    const onPointerUp = (e: PointerEvent) => {
      container.releasePointerCapture(e.pointerId);
      handleInteractionEnd();
    };

    const onPointerCancel = (e: PointerEvent) => {
      container.releasePointerCapture(e.pointerId);
      handleInteractionEnd();
    };

    // Use pointer events if available (better unified handling)
    const usePointerEvents = 'onpointerdown' in window;

    if (usePointerEvents) {
      container.addEventListener('pointerdown', onPointerDown, { passive: false });
      container.addEventListener('pointermove', onPointerMove, { passive: false });
      container.addEventListener('pointerup', onPointerUp, { passive: false });
      container.addEventListener('pointercancel', onPointerCancel, { passive: false });
    } else {
      // Fall back to separate touch and mouse events
      container.addEventListener('touchstart', onTouchStart, { passive: false });
      container.addEventListener('touchmove', onTouchMove, { passive: false });
      container.addEventListener('touchend', onTouchEnd, { passive: false });
      container.addEventListener('touchcancel', onTouchCancel, { passive: false });
      container.addEventListener('mousedown', onMouseDown, { passive: false });
      container.addEventListener('mousemove', onMouseMove, { passive: false });
      container.addEventListener('mouseup', onMouseUp, { passive: false });
      container.addEventListener('mouseleave', onMouseLeave, { passive: false });
    }

    // Handle window resize
    const onResize = () => {
      calculateZones();
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      if (usePointerEvents) {
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointercancel', onPointerCancel);
      } else {
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchend', onTouchEnd);
        container.removeEventListener('touchcancel', onTouchCancel);
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseup', onMouseUp);
        container.removeEventListener('mouseleave', onMouseLeave);
      }
      window.removeEventListener('resize', onResize);
    };
  }, [isLoaded, calculateZones, handleInteractionStart, handleInteractionEnd, handlePositionChange]);

  if (!isLoaded) {
    return <div className="loading">Loading audio...</div>;
  }

  return (
    <div
      ref={containerRef}
      className="phonics-word"
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          ref={(el) => (letterRefsRef.current[index] = el)}
          className={`letter ${activeLetter === index ? 'letter-active' : ''}`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
};
