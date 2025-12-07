import { RefObject, useCallback, useRef } from 'react';
import type {
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from 'react';

export interface ScrubUpdate {
  zoneIndex: number | null;
  ratio: number;
}

interface ScrubGestureConfig {
  zoneCount: number;
  containerRef: RefObject<HTMLElement>;
  onScrub: (update: ScrubUpdate) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
}

export const useScrubGesture = ({
  zoneCount,
  containerRef,
  onScrub,
  onScrubStart,
  onScrubEnd,
}: ScrubGestureConfig) => {
  const isScrubbingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const touchIdRef = useRef<number | null>(null);

  const computeScrubInfo = useCallback(
    (clientX: number): ScrubUpdate => {
      const container = containerRef.current;
      if (!container || zoneCount === 0) {
        return { zoneIndex: null, ratio: 0 };
      }
      const rect = container.getBoundingClientRect();
      const width = rect.width || 1;
      const position = clientX - rect.left;
      const rawRatio = position / width;
      const clampedRatio = Math.min(1, Math.max(0, rawRatio));
      const isInside = rawRatio >= 0 && rawRatio <= 1;
      const zoneIndex =
        isInside && zoneCount > 0
          ? Math.min(zoneCount - 1, Math.floor(clampedRatio * zoneCount))
          : null;

      return { zoneIndex, ratio: clampedRatio };
    },
    [containerRef, zoneCount],
  );

  const emitFromClientX = useCallback(
    (clientX: number) => {
      onScrub(computeScrubInfo(clientX));
    },
    [computeScrubInfo, onScrub],
  );

  const startScrub = useCallback(() => {
    if (isScrubbingRef.current) {
      return;
    }
    isScrubbingRef.current = true;
    onScrubStart?.();
  }, [onScrubStart]);

  const stopScrubbing = useCallback(() => {
    if (!isScrubbingRef.current) {
      return;
    }
    isScrubbingRef.current = false;
    pointerIdRef.current = null;
    touchIdRef.current = null;
    onScrubEnd?.();
  }, [onScrubEnd]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      const container = containerRef.current;
      if (!container) {
        return;
      }
      startScrub();
      pointerIdRef.current = event.pointerId;
      if (container.setPointerCapture) {
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // Safari <17 does not support pointer capture on some elements.
        }
      }
      emitFromClientX(event.clientX);
    },
    [containerRef, emitFromClientX, startScrub],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!isScrubbingRef.current) {
        return;
      }
      if (
        pointerIdRef.current !== null &&
        event.pointerId !== pointerIdRef.current
      ) {
        return;
      }
      emitFromClientX(event.clientX);
    },
    [emitFromClientX],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        pointerIdRef.current !== null &&
        event.pointerId !== pointerIdRef.current
      ) {
        return;
      }
      const container = containerRef.current;
      if (container?.releasePointerCapture) {
        try {
          container.releasePointerCapture(event.pointerId);
        } catch {
          // ignore
        }
      }
      stopScrubbing();
    },
    [containerRef, stopScrubbing],
  );

  const handlePointerLeave = useCallback(() => {
    stopScrubbing();
  }, [stopScrubbing]);

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      event.preventDefault();
      const touch = event.changedTouches[0];
      if (!touch) {
        return;
      }
      startScrub();
      touchIdRef.current = touch.identifier;
      emitFromClientX(touch.clientX);
    },
    [emitFromClientX, startScrub],
  );

  const handleTouchMove = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      if (!isScrubbingRef.current) {
        return;
      }
      const activeTouch = Array.from(event.touches).find(
        (touch) => touch.identifier === touchIdRef.current,
      );
      if (!activeTouch) {
        return;
      }
      emitFromClientX(activeTouch.clientX);
    },
    [emitFromClientX],
  );

  const handleTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      if (
        touchIdRef.current === null ||
        Array.from(event.changedTouches).every(
          (touch) => touch.identifier !== touchIdRef.current,
        )
      ) {
        return;
      }
      stopScrubbing();
    },
    [stopScrubbing],
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: stopScrubbing,
    onPointerLeave: handlePointerLeave,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };
};
