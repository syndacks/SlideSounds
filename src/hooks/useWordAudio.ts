import { useCallback, useMemo } from 'react';
import { parseWordToPhonemes } from '../lib/wordParser';
import { WordDefinition } from '../types/phoneme';
import { useWordBlendAudio } from './useWordBlendAudio';

interface UseWordAudioResult {
  play: () => Promise<void> | void;
  isLoading: boolean;
  hasAudio: boolean;
  source: 'prerecorded' | 'blended' | null;
  error: string | null;
}

/**
 * Small helper hook used by the comprehension check to play back the full word audio.
 * Prefers prerecorded word audio and falls back to phoneme blending when needed.
 */
export const useWordAudio = (word: WordDefinition | undefined): UseWordAudioResult => {
  const parsed = useMemo(() => {
    if (!word) return null;
    return parseWordToPhonemes(word.text);
  }, [word]);

  const { playBlend, isReady, isBuilding, audioSource, error } = useWordBlendAudio(
    word?.id ?? '',
    parsed?.units ?? [],
  );

  const play = useCallback(() => {
    if (!word) return;
    return playBlend();
  }, [playBlend, word]);

  return {
    play,
    isLoading: Boolean(word) && (isBuilding || !isReady),
    hasAudio: Boolean(word) && isReady,
    source: audioSource,
    error,
  };
};
