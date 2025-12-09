import { useCallback, useEffect, useMemo } from 'react';
import { parseWordToPhonemes } from '../lib/wordParser';
import { WordDefinition } from '../types/phoneme';
import { useWordBlendAudio } from './useWordBlendAudio';

type AutoPlayStatus = 'scheduled' | 'played';

interface AutoPlaySessionState {
  sessionKey: string;
  status: AutoPlayStatus;
  timeoutId?: number;
}

const autoPlaySessions = new Map<string, AutoPlaySessionState>();
const DEFAULT_SESSION_KEY = '__default__';

interface UseWordAudioOptions {
  autoPlayOnReady?: boolean;
  autoPlayDelay?: number;
  autoPlaySessionKey?: string;
}

interface UseWordAudioResult {
  play: () => Promise<void> | void;
  isLoading: boolean;
  hasAudio: boolean;
  source: 'prerecorded' | 'blended' | null;
  error: string | null;
  /** Duration of the synthesized or prerecorded audio, in seconds */
  duration: number | null;
}

/**
 * Small helper hook used by the comprehension check to play back the full word audio.
 * Prefers prerecorded word audio and falls back to phoneme blending when needed.
 */
export const useWordAudio = (
  word: WordDefinition | undefined,
  options: UseWordAudioOptions = {},
): UseWordAudioResult => {
  const {
    autoPlayOnReady = false,
    autoPlayDelay = 500,
    autoPlaySessionKey,
  } = options;
  const parsed = useMemo(() => {
    if (!word) return null;
    return parseWordToPhonemes(word.text);
  }, [word]);

  const { playBlend, isReady, isBuilding, audioSource, error, duration } = useWordBlendAudio(
    word?.id ?? '',
    parsed?.units ?? [],
  );

  const play = useCallback(() => {
    if (!word) return;
    return playBlend();
  }, [playBlend, word]);

  useEffect(() => {
    if (!autoPlayOnReady || !word || !isReady) return;

    const sessionKey = autoPlaySessionKey ?? DEFAULT_SESSION_KEY;
    const session = autoPlaySessions.get(word.id);
    if (session && session.sessionKey === sessionKey) {
      if (session.status === 'scheduled' || session.status === 'played') {
        return;
      }
    }

    const timeoutId = window.setTimeout(() => {
      autoPlaySessions.set(word.id, {
        sessionKey,
        status: 'played',
      });
      void playBlend();
    }, autoPlayDelay);

    autoPlaySessions.set(word.id, {
      sessionKey,
      status: 'scheduled',
      timeoutId,
    });

    return () => {
      const currentSession = autoPlaySessions.get(word.id);
      if (
        currentSession &&
        currentSession.sessionKey === sessionKey &&
        currentSession.status === 'scheduled'
      ) {
        window.clearTimeout(currentSession.timeoutId);
        autoPlaySessions.delete(word.id);
      }
    };
  }, [autoPlayOnReady, autoPlayDelay, autoPlaySessionKey, word?.id, isReady, playBlend]);

  return {
    play,
    isLoading: Boolean(word) && (isBuilding || !isReady),
    hasAudio: Boolean(word) && isReady,
    source: audioSource,
    error,
    duration,
  };
};
