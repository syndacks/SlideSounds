import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PhonemeUnit } from '../types/phoneme';
import { useAudioEngine } from './useAudioEngine';
import { useWordBlendAudio } from './useWordBlendAudio';

/**
 * Clamp a ratio to 0-1 range
 */
const clampRatio = (ratio: number): number => {
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(1, Math.max(0, ratio));
};

interface UseWordScrubberResult {
  /**
   * Set the current scrub position (0-1 ratio).
   * When position crosses into a new phoneme zone, that phoneme plays.
   */
  setPosition: (ratio: number) => void;
  /**
   * Stop any currently playing audio.
   */
  stop: () => void;
  /**
   * Play the whole word (TTS) - call this on completion.
   */
  playWord: () => void;
  /**
   * Whether the scrubber is ready (phonemes preloaded).
   */
  isReady: boolean;
  /**
   * Whether audio is still loading.
   */
  isLoading: boolean;
  /**
   * Error message if loading failed.
   */
  error: string | null;
  /**
   * Duration of the whole word audio (for reference).
   */
  duration: number | null;
  /**
   * Ratio positions for each letter anchor (0-1).
   * Used by the visual track to position letter labels.
   */
  anchorRatios: number[];
}

/**
 * Phoneme-zone-based scrubbing hook.
 *
 * Instead of scrubbing through a single TTS buffer (which sounds like a slow
 * record spinning), this maps the scrub position to discrete phoneme zones.
 * When the user drags into a new zone, the corresponding phoneme plays with
 * crossfade. This reinforces the letter→sound mapping for learning to read.
 *
 * The whole-word TTS audio is preserved for playWord() on completion.
 */
export const useWordScrubber = (
  wordId: string,
  units: PhonemeUnit[],
): UseWordScrubberResult => {
  const {
    preloadPhonemes,
    playPhoneme,
    stopAll,
    resetLastPlayed,
    resume,
  } = useAudioEngine();

  // Load whole-word TTS for completion playback
  const {
    playBlend,
    isReady: isBlendReady,
    isBuilding,
    error: blendError,
    duration,
  } = useWordBlendAudio(wordId, units);

  // Track the current zone to avoid re-triggering same phoneme
  const currentZoneRef = useRef<number | null>(null);
  const isPreloadedRef = useRef(false);
  // Track if this is a fresh scrub session (to play sound on first touch)
  const isFirstTouchRef = useRef(true);

  // Filter to playable units (have audio files)
  const playableUnits = useMemo(
    () => units.filter((unit) => unit.audioFile && !unit.isSilent),
    [units],
  );

  const anchorRatios = useMemo(() => {
    if (units.length === 0) return [];
    if (units.length === 1) return [0.5];

    // Special-case: 2-unit words where the second unit is a multi-letter
    // chunk (e.g. r + an, h + am). Visually these should sit closer together
    // near the center so the gap between the consonant and welded chunk
    // feels more like a typical CVC spacing.
    if (units.length === 2 && units[1].grapheme.length > 1) {
      const center = 0.5;
      const gap = 0.24; // distance between unit centers
      return [center - gap / 2, center + gap / 2];
    }

    const baseAnchors = units.map((_, index) => index / (units.length - 1));

    const padding = (() => {
      if (units.length === 2) return 0.25;
      if (units.length === 3) return 0.18;
      if (units.length === 4) return 0.12;
      return 0.08;
    })();

    const range = 1 - padding * 2;
    return baseAnchors.map((value) => padding + value * range);
  }, [units]);

  // Preload phoneme audio on mount/word change
  useEffect(() => {
    isPreloadedRef.current = false;

    if (playableUnits.length === 0) {
      isPreloadedRef.current = true;
      return;
    }

    preloadPhonemes(playableUnits)
      .then(() => {
        isPreloadedRef.current = true;
      })
      .catch(console.error);
  }, [preloadPhonemes, playableUnits]);

  // Reset zone tracking when word changes
  useEffect(() => {
    currentZoneRef.current = null;
    resetLastPlayed();
  }, [wordId, resetLastPlayed]);

  /**
   * Calculate which phoneme zone a ratio falls into by finding the nearest anchor.
   */
  const getZoneAtRatio = useCallback(
    (ratio: number): number | null => {
      if (anchorRatios.length === 0) return null;
      const clamped = clampRatio(ratio);

      let closestIndex = 0;
      let minDistance = Math.abs(clamped - anchorRatios[0]);

      for (let i = 1; i < anchorRatios.length; i++) {
        const distance = Math.abs(clamped - anchorRatios[i]);
        if (distance < minDistance) {
          closestIndex = i;
          minDistance = distance;
        }
      }

      return closestIndex;
    },
    [anchorRatios],
  );

  /**
   * Set scrub position. When crossing into a new zone, play that phoneme.
   * Also plays on first touch of a new scrub session.
   */
  const setPosition = useCallback(
    async (ratio: number) => {
      const zoneIndex = getZoneAtRatio(ratio);

      if (zoneIndex === null) return;

      // On first touch of a new session, always play (even if same zone as before)
      const isNewSession = isFirstTouchRef.current;
      if (isNewSession) {
        isFirstTouchRef.current = false;
      }

      // Skip if same zone and not a new session
      if (zoneIndex === currentZoneRef.current && !isNewSession) {
        return;
      }

      currentZoneRef.current = zoneIndex;

      const unit = units[zoneIndex];
      if (!unit || !unit.audioFile || unit.isSilent) {
        return;
      }

      // Ensure audio context is running
      await resume();

      // Play the phoneme with crossfade for smooth transitions
      await playPhoneme(unit, { crossfade: true });
    },
    [getZoneAtRatio, playPhoneme, resume, units],
  );

  /**
   * Stop any playing audio and reset zone tracking.
   * Prepares for the next scrub session to trigger sound on first touch.
   */
  const stop = useCallback(() => {
    stopAll(50);
    currentZoneRef.current = null;
    isFirstTouchRef.current = true; // Reset so next session plays on first touch
    resetLastPlayed();
  }, [stopAll, resetLastPlayed]);

  /**
   * Play the whole word (TTS) - for completion celebration.
   */
  const playWord = useCallback(async () => {
    if (!isBlendReady) return;
    await resume();
    stopAll(50);
    // Small delay for the stop fade to complete
    setTimeout(() => {
      playBlend();
    }, 60);
  }, [isBlendReady, playBlend, resume, stopAll]);

  const isReady = isPreloadedRef.current && !isBuilding;
  const error = blendError;

  return {
    setPosition,
    stop,
    playWord,
    isReady,
    isLoading: isBuilding || !isPreloadedRef.current,
    error,
    duration,
    anchorRatios,
  };
};
