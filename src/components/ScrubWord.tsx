import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseWordToPhonemes } from '../lib/wordParser';
import { WordDefinition } from '../types/phoneme';
import { ScrubTrack } from './ScrubTrack';
import { useWordScrubber } from '../hooks/useWordScrubber';
import { ScrubDevPanel } from './dev/ScrubDevPanel';
import { useGameStore } from '../stores/gameStore';

interface ScrubWordProps {
  word: WordDefinition;
  onComplete?: () => void;
  onProgressChange?: (ratio: number) => void;
  onInteractionStart?: () => void;
  isWordAudioReady?: boolean;
  isLocked?: boolean;
  lockMessage?: string;
}

export const ScrubWord = ({
  word,
  onComplete,
  onProgressChange,
  onInteractionStart,
  isWordAudioReady = true,
  isLocked = false,
  lockMessage,
}: ScrubWordProps) => {
  const devToolsEnabled = useGameStore((state) => state.devToolsEnabled);
  const isDraggingRef = useRef(false);
  const pendingCompletionRef = useRef(false);
  const maxProgressRef = useRef(0);
  // Track if user started from the beginning (to require full scrub)
  const startedFromBeginningRef = useRef(false);

  const [progressRatio, setProgressRatio] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);

  // Parse the word into phoneme units
  const parsed = useMemo(() => parseWordToPhonemes(word.text), [word.text]);
  const { units } = parsed;
  const graphemes = useMemo(() => units.map((unit) => unit.grapheme), [units]);
  const categories = useMemo(() => units.map((unit) => unit.category), [units]);

  const {
    setPosition: setScrubPosition,
    stop: stopScrubPlayback,
    playWord,
    anchorRatios,
    duration,
    isReady: isScrubberReady,
    error: scrubError,
  } = useWordScrubber(word.id, units);
  const [anchorOverrides, setAnchorOverrides] = useState<number[] | null>(null);
  const effectiveAnchors = anchorOverrides ?? anchorRatios;

  // Reset state when word changes
  useEffect(() => {
    stopScrubPlayback();
    setProgressRatio(0);
    setHasCompletedOnce(false);
    pendingCompletionRef.current = false;
    maxProgressRef.current = 0;
    startedFromBeginningRef.current = false;
    setAnchorOverrides(null);
  }, [anchorRatios, stopScrubPlayback, word.id]);

  const handleScrubStart = useCallback(() => {
    if (isLocked) return;
    onInteractionStart?.();
    isDraggingRef.current = true;
    setIsScrubbing(true);
  }, [isLocked, onInteractionStart]);

  const handleScrubMove = useCallback(
    (ratio: number) => {
      if (isLocked) return;
      setProgressRatio(ratio);
      maxProgressRef.current = Math.max(maxProgressRef.current, ratio);
      // Track if user ever touched the beginning (first 15% of track)
      if (ratio <= 0.15) {
        startedFromBeginningRef.current = true;
      }
      setScrubPosition(ratio);
    },
    [isLocked, setScrubPosition],
  );

  const handleScrubEnd = useCallback(
    (ratio: number) => {
      if (isLocked) return;
      if (!isDraggingRef.current) {
        return;
      }

      const reachedEndOnce = maxProgressRef.current >= 0.92;
      const startedFromBeginning = startedFromBeginningRef.current;
      // Require user to have touched the beginning AND reached the end
      const didCompleteWord = startedFromBeginning && reachedEndOnce && ratio >= 0.9 && isScrubberReady;
      const canReportCompletion = isScrubberReady && isWordAudioReady;

      stopScrubPlayback();
      isDraggingRef.current = false;
      setIsScrubbing(false);
      
      // Reset tracking for next attempt (only keep if completed)
      if (!didCompleteWord) {
        maxProgressRef.current = 0;
        startedFromBeginningRef.current = false;
      }

      if (didCompleteWord) {
        if (canReportCompletion) {
          pendingCompletionRef.current = false;
          setHasCompletedOnce(true);
          // Play the whole word as celebration/validation
          playWord();
          onComplete?.();
        } else {
          pendingCompletionRef.current = true;
        }
      }
    },
    [isLocked, isScrubberReady, isWordAudioReady, onComplete, playWord, stopScrubPlayback],
  );

  // If the learner already completed the scrub while audio was still loading,
  // automatically fire completion once the word audio becomes ready.
  useEffect(() => {
    if (
      !isWordAudioReady ||
      !isScrubberReady ||
      !pendingCompletionRef.current
    ) {
      return;
    }
    pendingCompletionRef.current = false;
    setHasCompletedOnce(true);
    playWord();
    onComplete?.();
  }, [isScrubberReady, isWordAudioReady, onComplete, playWord]);

  useEffect(() => {
    onProgressChange?.(progressRatio);
  }, [onProgressChange, progressRatio]);

  return (
    <div className="scrub-word-wrapper">
      <div
        className={`scrub-word${hasCompletedOnce ? ' scrub-word--complete' : ''}${isScrubbing ? ' scrub-word--scrubbing' : ''}${isLocked ? ' scrub-word--locked' : ''}`}
        role="group"
        aria-label={`Scrubbable word ${word.displayText ?? word.text}`}
      >
        {isLocked && (
          <div className="scrub-word__lock-banner">
            <span className="scrub-word__lock-icon" aria-hidden="true">
              🔒
            </span>
            <span>{lockMessage ?? 'Say the word to unlock the slider'}</span>
          </div>
        )}
        <ScrubTrack
          key={word.id}
          letters={graphemes}
          letterCategories={categories}
          letterPositions={effectiveAnchors}
          onScrubStart={handleScrubStart}
          onScrubMove={handleScrubMove}
          onScrubEnd={handleScrubEnd}
        />
      </div>

      {/* Simple swipe hint - just an animated hand */}
      <div
        className={`scrub-word__hint${isScrubbing || hasCompletedOnce ? ' scrub-word__hint--hidden' : ''}`}
        aria-hidden="true"
      >
        <span className="scrub-word__hint-hand">👆</span>
        <span className="scrub-word__hint-arrow">→</span>
      </div>

      {import.meta.env.DEV && devToolsEnabled && (
        <ScrubDevPanel
          wordId={word.id}
          letters={graphemes}
          anchorRatios={effectiveAnchors}
          durationSeconds={duration}
          progressRatio={progressRatio}
          isAudioReady={isScrubberReady}
          audioError={scrubError}
          onAnchorChange={(index, ratio) => {
            setAnchorOverrides((current) => {
              const target = [...(current ?? anchorRatios)];
              target[index] = ratio;
              return target;
            });
          }}
          onResetAnchors={() => setAnchorOverrides(null)}
        />
      )}
    </div>
  );
};
