import { useCallback, useEffect, useState, useMemo } from 'react';
import { PhonemeUnit } from '../types/phoneme';
import { buildWordAudioBuffer, WordAudioBuffer } from '../lib/wordAudioBuilder';
import { useAudioEngine } from './useAudioEngine';

export const useWordBlendAudio = (units: PhonemeUnit[]) => {
  const { resume, getAudioBuffer, getContext } = useAudioEngine();
  const [wordAudio, setWordAudio] = useState<WordAudioBuffer | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);

  // Filter to only units that have audio files
  const playableUnits = useMemo(
    () => units.filter((unit) => unit.audioFile && !unit.isSilent),
    [units],
  );

  useEffect(() => {
    let canceled = false;

    if (playableUnits.length === 0) {
      setWordAudio(null);
      setBuildError(null);
      return;
    }

    const build = async () => {
      setIsBuilding(true);
      setBuildError(null);

      try {
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
          return;
        }

        const context = getContext();
        const wordBuffer = buildWordAudioBuffer(context, successfulBuffers);

        if (!canceled) {
          setWordAudio(wordBuffer);
        }
      } catch (err) {
        if (!canceled) {
          setBuildError(err instanceof Error ? err.message : 'Unknown error');
          setWordAudio(null);
        }
      } finally {
        if (!canceled) {
          setIsBuilding(false);
        }
      }
    };

    build();

    return () => {
      canceled = true;
    };
  }, [getAudioBuffer, getContext, playableUnits]);

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
  };
};
