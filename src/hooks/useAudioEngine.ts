import { useCallback, useEffect, useRef, useState } from 'react';
import { PhonemeUnit } from '../types/phoneme';

type AudioStatus = AudioContextState | 'interrupted';

// Module-level singletons for audio context and caching
let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const loadingCache = new Map<string, Promise<AudioBuffer>>();

// Currently playing sources (for overlap/cancellation)
let activeSources: AudioBufferSourceNode[] = [];

/**
 * Get or create the audio context
 */
const ensureContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

/**
 * Normalize audio path
 */
const normalizePath = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
};

/**
 * Load an audio buffer (with caching)
 */
const loadBuffer = async (path: string): Promise<AudioBuffer> => {
  const normalizedPath = normalizePath(path);

  if (bufferCache.has(normalizedPath)) {
    return bufferCache.get(normalizedPath)!;
  }

  if (loadingCache.has(normalizedPath)) {
    return loadingCache.get(normalizedPath)!;
  }

  const ctx = ensureContext();
  const loadPromise = fetch(normalizedPath)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${normalizedPath}: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return ctx.decodeAudioData(arrayBuffer);
    })
    .then((decoded) => {
      bufferCache.set(normalizedPath, decoded);
      loadingCache.delete(normalizedPath);
      return decoded;
    })
    .catch((error) => {
      loadingCache.delete(normalizedPath);
      throw error;
    });

  loadingCache.set(normalizedPath, loadPromise);
  return loadPromise;
};

/**
 * Resume audio context if suspended
 */
const resumeIfNeeded = async (): Promise<void> => {
  const ctx = ensureContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

/**
 * Stop all currently playing sounds with quick fade
 */
const stopAllSounds = (fadeMs: number = 50): void => {
  const ctx = ensureContext();
  const now = ctx.currentTime;

  activeSources.forEach((source) => {
    try {
      // Quick fade out to avoid click
      const gain = (source as any)._gainNode as GainNode | undefined;
      if (gain) {
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
      }
      source.stop(now + fadeMs / 1000 + 0.01);
    } catch {
      // Source may already be stopped
    }
  });

  activeSources = [];
};

/**
 * Play an audio buffer with gain control
 */
const playBufferWithGain = (
  buffer: AudioBuffer,
  options: {
    fadeInMs?: number;
    fadeOutMs?: number;
    volume?: number;
    onEnded?: () => void;
  } = {},
): AudioBufferSourceNode => {
  const ctx = ensureContext();
  const { fadeInMs = 20, volume = 1, onEnded } = options;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Create gain node for fading
  const gainNode = ctx.createGain();
  const now = ctx.currentTime;

  // Fade in
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + fadeInMs / 1000);

  // Connect nodes
  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Store reference to gain node for later fade-out
  (source as any)._gainNode = gainNode;

  // Track active sources
  activeSources.push(source);

  source.onended = () => {
    const index = activeSources.indexOf(source);
    if (index > -1) {
      activeSources.splice(index, 1);
    }
    onEnded?.();
  };

  source.start(0);

  return source;
};

/**
 * Play a phoneme with proper crossfade behavior
 * - Continuous sounds: fade in with overlap
 * - Stop consonants: quick attack, no overlap
 */
const playPhonemeBuffer = async (
  unit: PhonemeUnit,
  options: {
    crossfade?: boolean;
  } = {},
): Promise<void> => {
  if (!unit.audioFile) {
    return; // Silent phoneme
  }

  const buffer = await loadBuffer(unit.audioFile);

  if (unit.isStop) {
    // Stop consonant: stop previous sounds immediately, play with quick attack
    stopAllSounds(10);
    playBufferWithGain(buffer, {
      fadeInMs: 5,
      volume: 1,
    });
  } else {
    // Continuous consonant: crossfade with previous
    if (options.crossfade) {
      // Fade out previous sounds
      stopAllSounds(35);
    } else {
      stopAllSounds(50);
    }

    playBufferWithGain(buffer, {
      fadeInMs: 25,
      volume: 1,
    });
  }
};

/**
 * Audio engine hook
 */
export const useAudioEngine = () => {
  const [status, setStatus] = useState<AudioStatus>(() => {
    try {
      return ensureContext().state;
    } catch {
      return 'suspended';
    }
  });

  // Track last played phoneme to avoid repeats
  const lastPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    const ctx = ensureContext();
    const interval = window.setInterval(() => {
      if (status !== ctx.state) {
        setStatus(ctx.state as AudioStatus);
      }
    }, 200);
    return () => window.clearInterval(interval);
  }, [status]);

  /**
   * Preload all phonemes for a word
   */
  const preloadPhonemes = useCallback(async (units: PhonemeUnit[]) => {
    const toLoad = units.filter((unit) => unit.audioFile);
    await Promise.all(toLoad.map((unit) => loadBuffer(unit.audioFile)));
  }, []);

  /**
   * Play a single phoneme
   */
  const playPhoneme = useCallback(
    async (unit: PhonemeUnit, options: { crossfade?: boolean } = {}) => {
      await resumeIfNeeded();

      // Skip if this is a silent phoneme
      if (unit.isSilent || !unit.audioFile) {
        return;
      }

      // For stop consonants, always play
      // For continuous, check if it's a repeat
      if (!unit.isStop && lastPlayedRef.current === unit.id) {
        return;
      }

      lastPlayedRef.current = unit.id;
      await playPhonemeBuffer(unit, options);
    },
    [],
  );

  /**
   * Stop all currently playing sounds
   */
  const stopAll = useCallback((fadeMs?: number) => {
    stopAllSounds(fadeMs);
    lastPlayedRef.current = null;
  }, []);

  /**
   * Reset last played tracking
   */
  const resetLastPlayed = useCallback(() => {
    lastPlayedRef.current = null;
  }, []);

  /**
   * Get audio buffer for a phoneme
   */
  const getAudioBuffer = useCallback(
    async (unit: PhonemeUnit): Promise<AudioBuffer> => {
      if (!unit.audioFile) {
        throw new Error(`No audio file for phoneme: ${unit.grapheme}`);
      }
      return loadBuffer(unit.audioFile);
    },
    [],
  );

  return {
    status,
    preloadPhonemes,
    playPhoneme,
    stopAll,
    resetLastPlayed,
    resume: resumeIfNeeded,
    getAudioBuffer,
    getContext: ensureContext,
  };
};
