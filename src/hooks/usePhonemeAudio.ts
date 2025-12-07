import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioBufferMap, PhonemeMap } from '../types/phoneme';

// Fade times in seconds for smooth audio transitions
const FADE_IN_TIME = 0.01; // 10ms fade in
const FADE_OUT_TIME = 0.05; // 50ms fade out

export interface AudioPlayHandle {
  stop: () => void;
}

export const usePhonemeAudio = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<AudioBufferMap>({});
  const phonemeMapRef = useRef<PhonemeMap>({});
  const currentSourceRef = useRef<{
    source: AudioBufferSourceNode;
    gainNode: GainNode;
  } | null>(null);
  const isContextResumedRef = useRef(false);

  // Resume AudioContext (needed for mobile browsers)
  const ensureContextResumed = useCallback(async () => {
    if (!audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        isContextResumedRef.current = true;
      } catch (e) {
        console.warn('Failed to resume AudioContext:', e);
      }
    }
  }, []);

  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create AudioContext with low latency hint
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({
          latencyHint: 'interactive',
        });

        // Load phoneme map
        const mapResponse = await fetch('/audio/phonemes/phoneme-map.json');
        const phonemeMap: PhonemeMap = await mapResponse.json();
        phonemeMapRef.current = phonemeMap;

        // Preload all audio files
        const loadPromises = Object.entries(phonemeMap).map(async ([letter, filename]) => {
          try {
            const response = await fetch(`/audio/phonemes/${filename}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            buffersRef.current[letter] = audioBuffer;
          } catch (error) {
            console.error(`Failed to load phoneme ${letter}:`, error);
          }
        });

        await Promise.all(loadPromises);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Stop currently playing sound with fade out
  const stopCurrentSound = useCallback(() => {
    if (!currentSourceRef.current || !audioContextRef.current) return;

    const { source, gainNode } = currentSourceRef.current;
    const now = audioContextRef.current.currentTime;

    try {
      // Quick fade out to avoid click
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + FADE_OUT_TIME);

      // Stop the source after fade out
      source.stop(now + FADE_OUT_TIME + 0.01);
    } catch (e) {
      // Source may have already stopped
    }

    currentSourceRef.current = null;
  }, []);

  // Play a phoneme with proper audio management
  const playPhoneme = useCallback((letter: string): AudioPlayHandle | null => {
    if (!audioContextRef.current || !buffersRef.current[letter]) {
      console.warn(`No audio buffer for letter: ${letter}`);
      return null;
    }

    // Ensure context is running
    ensureContextResumed();

    // Stop any currently playing sound
    stopCurrentSound();

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create source
    const source = ctx.createBufferSource();
    source.buffer = buffersRef.current[letter];

    // Create gain node for fade in/out
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + FADE_IN_TIME);

    // Connect: source -> gain -> destination
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Track this as the current source
    currentSourceRef.current = { source, gainNode };

    // Start playback
    source.start(0);

    // Clean up reference when sound ends naturally
    source.onended = () => {
      if (currentSourceRef.current?.source === source) {
        currentSourceRef.current = null;
      }
    };

    // Return handle for manual control
    return {
      stop: () => {
        if (currentSourceRef.current?.source === source) {
          stopCurrentSound();
        }
      },
    };
  }, [ensureContextResumed, stopCurrentSound]);

  const getPhonemeForLetter = useCallback((letter: string): string | null => {
    return phonemeMapRef.current[letter] || null;
  }, []);

  return {
    isLoaded,
    playPhoneme,
    stopCurrentSound,
    getPhonemeForLetter,
    ensureContextResumed,
  };
};
