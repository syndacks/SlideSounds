import { useCallback, useEffect, useState, useMemo } from 'react';
import { PhonemeUnit } from '../types/phoneme';
import { buildWordAudioBuffer, WordAudioBuffer } from '../lib/wordAudioBuilder';
import { useAudioEngine } from './useAudioEngine';

export const useWordBlendAudio = (wordId: string, units: PhonemeUnit[]) => {
  const { resume, getAudioBuffer, getContext } = useAudioEngine();
  const [wordAudio, setWordAudio] = useState<WordAudioBuffer | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<'prerecorded' | 'blended' | null>(null);

  // Filter to only units that have audio files
  const playableUnits = useMemo(
    () => units.filter((unit) => unit.audioFile && !unit.isSilent),
    [units],
  );

  useEffect(() => {
    let canceled = false;

    if (!wordId || playableUnits.length === 0) {
      setWordAudio(null);
      setBuildError(null);
      setAudioSource(null);
      return;
    }

    const loadAudio = async () => {
      setIsBuilding(true);
      setBuildError(null);
      setAudioSource(null);

      try {
        // STEP 1: Try to load prerecorded word audio
        const prerecordedPath = `/audio/words/${wordId}.mp3`;

        try {
          // Create a dummy unit to leverage getAudioBuffer
          const dummyUnit: PhonemeUnit = {
            id: 'word-audio',
            grapheme: wordId,
            label: wordId,
            audioFile: prerecordedPath,
            category: 'short_vowel',
            isStop: false,
          };

          const prerecordedBuffer = await getAudioBuffer(dummyUnit);

          if (canceled) return;

          // Wrap in WordAudioBuffer format
          const wordBuffer: WordAudioBuffer = {
            buffer: prerecordedBuffer,
            zones: [{
              index: 0,
              startSample: 0,
              endSample: prerecordedBuffer.length,
              startTime: 0,
              endTime: prerecordedBuffer.duration,
              isStop: false,
            }],
            duration: prerecordedBuffer.duration,
          };

          setWordAudio(wordBuffer);
          setAudioSource('prerecorded');
          setIsBuilding(false);
          return; // SUCCESS - prerecorded audio loaded
        } catch (prerecordedError) {
          // Prerecorded audio not found or failed to load
          // Fall through to blended approach
          console.log(`Prerecorded audio not available for "${wordId}", using blended phonemes`);
        }

        // STEP 2: Fallback to blended phoneme approach
        if (canceled) return;

        // Load all audio buffers
        const bufferResults = await Promise.allSettled(
          playableUnits.map(async (unit) => ({
            unit,
            buffer: await getAudioBuffer(unit),
          })),
        );

        if (canceled) return;

        // Filter successful loads
        const successfulBuffers = bufferResults
          .filter(
            (result): result is PromiseFulfilledResult<{ unit: PhonemeUnit; buffer: AudioBuffer }> =>
              result.status === 'fulfilled',
          )
          .map((result) => result.value);

        if (successfulBuffers.length === 0) {
          setBuildError('No audio buffers could be loaded');
          setWordAudio(null);
          setAudioSource(null);
          return;
        }

        const context = getContext();
        const wordBuffer = buildWordAudioBuffer(context, successfulBuffers);

        if (!canceled) {
          setWordAudio(wordBuffer);
          setAudioSource('blended');
        }
      } catch (err) {
        if (!canceled) {
          setBuildError(err instanceof Error ? err.message : 'Unknown error');
          setWordAudio(null);
          setAudioSource(null);
        }
      } finally {
        if (!canceled) {
          setIsBuilding(false);
        }
      }
    };

    loadAudio();

    return () => {
      canceled = true;
    };
  }, [getAudioBuffer, getContext, playableUnits, wordId]);

  const playBlend = useCallback(async () => {
    if (!wordAudio) return;

    await resume();
    const context = getContext();

    const source = context.createBufferSource();
    source.buffer = wordAudio.buffer;

    // Create gain node for fade in
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.03);

    source.connect(gain);
    gain.connect(context.destination);
    source.start();
  }, [getContext, resume, wordAudio]);

  return {
    playBlend,
    isReady: Boolean(wordAudio) && !isBuilding,
    isBuilding,
    error: buildError,
    audioSource,
  };
};
