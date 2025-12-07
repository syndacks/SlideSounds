import { PhonemeUnit } from '../types/phoneme';

const CONTINUOUS_OVERLAP_SECONDS = 0.035;

export interface ZoneTiming {
  index: number;
  startSample: number;
  endSample: number;
  startTime: number;
  endTime: number;
  isStop: boolean;
}

export interface WordAudioBuffer {
  buffer: AudioBuffer;
  zones: ZoneTiming[];
  duration: number;
}

export const buildWordAudioBuffer = (
  context: AudioContext,
  entries: Array<{ unit: PhonemeUnit; buffer: AudioBuffer }>,
): WordAudioBuffer | null => {
  if (entries.length === 0) {
    return null;
  }

  const sampleRate = context.sampleRate;
  const channelCount = entries.reduce(
    (max, entry) => Math.max(max, entry.buffer.numberOfChannels),
    1,
  );

  let totalSamples = 0;
  const segments = entries.map((entry, index) => {
    const overlapSamples =
      index === 0 || entry.unit.isStop
        ? 0
        : Math.min(
            Math.floor(CONTINUOUS_OVERLAP_SECONDS * sampleRate),
            Math.floor(entry.buffer.length / 2),
          );
    const startSample = Math.max(0, totalSamples - overlapSamples);
    const endSample = startSample + entry.buffer.length;
    totalSamples = endSample;
    return {
      ...entry,
      startSample,
      endSample,
    };
  });

  const output = context.createBuffer(channelCount, totalSamples, sampleRate);

  segments.forEach((segment) => {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const destination = output.getChannelData(channel);
      const sourceChannelIndex = Math.min(
        channel,
        segment.buffer.numberOfChannels - 1,
      );
      const source = segment.buffer.getChannelData(sourceChannelIndex);
      for (let i = 0; i < source.length; i += 1) {
        const targetIndex = segment.startSample + i;
        destination[targetIndex] += source[i];
      }
    }
  });

  const zones: ZoneTiming[] = segments.map((segment, index) => ({
    index,
    startSample: segment.startSample,
    endSample: segment.endSample,
    startTime: segment.startSample / sampleRate,
    endTime: segment.endSample / sampleRate,
    isStop: segment.unit.isStop,
  }));

  return {
    buffer: output,
    zones,
    duration: output.duration,
  };
};
