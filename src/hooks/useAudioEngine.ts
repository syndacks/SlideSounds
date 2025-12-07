import { useCallback, useEffect, useState } from 'react';
import { PhonemeUnit } from '../types/phoneme';

type AudioStatus = AudioContextState | 'interrupted';

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const loadingCache = new Map<string, Promise<AudioBuffer>>();

const ensureContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const normalizePath = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
};

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
        throw new Error(`Failed to load ${normalizedPath}`);
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

const resumeIfNeeded = async (): Promise<void> => {
  const ctx = ensureContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

const playBuffer = async (path: string): Promise<void> => {
  const ctx = ensureContext();
  const buffer = await loadBuffer(path);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};

export const useAudioEngine = () => {
  const [status, setStatus] = useState<AudioStatus>(() => ensureContext().state);

  useEffect(() => {
    const ctx = ensureContext();
    const interval = window.setInterval(() => {
      if (status !== ctx.state) {
        setStatus(ctx.state as AudioStatus);
      }
    }, 200);
    return () => window.clearInterval(interval);
  }, [status]);

  const preloadPhonemes = useCallback(async (units: PhonemeUnit[]) => {
    await Promise.all(units.map((unit) => loadBuffer(unit.audioFile)));
  }, []);

  const playPhoneme = useCallback(async (unit: PhonemeUnit) => {
    await resumeIfNeeded();
    await playBuffer(unit.audioFile);
  }, []);

  return {
    status,
    preloadPhonemes,
    playPhoneme,
    resume: resumeIfNeeded,
  };
};
