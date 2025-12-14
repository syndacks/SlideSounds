export interface WordAudioAnchor {
  letterIndex: number;
  label?: string;
  timeMs: number;
}

export interface WordAudioMetadata {
  wordId: string;
  durationMs?: number;
  anchors: WordAudioAnchor[];
}

const WORD_AUDIO_METADATA: WordAudioMetadata[] = [
  {
    wordId: 'can',
    durationMs: 552,
    anchors: [
      { letterIndex: 0, label: 'c', timeMs: 66 },
      { letterIndex: 1, label: 'a', timeMs: 248 },
      { letterIndex: 2, label: 'n', timeMs: 453 },
    ],
  },
  {
    wordId: 'cat',
    durationMs: 648,
    anchors: [
      { letterIndex: 0, label: 'c', timeMs: 78 },
      { letterIndex: 1, label: 'a', timeMs: 292 },
      { letterIndex: 2, label: 't', timeMs: 531 },
    ],
  },
  {
    wordId: 'map',
    durationMs: 600,
    anchors: [
      { letterIndex: 0, label: 'm', timeMs: 72 },
      { letterIndex: 1, label: 'a', timeMs: 270 },
      { letterIndex: 2, label: 'p', timeMs: 492 },
    ],
  },
  {
    wordId: 'mat',
    durationMs: 648,
    anchors: [
      { letterIndex: 0, label: 'm', timeMs: 78 },
      { letterIndex: 1, label: 'a', timeMs: 292 },
      { letterIndex: 2, label: 't', timeMs: 531 },
    ],
  },
  {
    wordId: 'pan',
    durationMs: 768,
    anchors: [
      { letterIndex: 0, label: 'p', timeMs: 92 },
      { letterIndex: 1, label: 'a', timeMs: 346 },
      { letterIndex: 2, label: 'n', timeMs: 630 },
    ],
  },
  {
    wordId: 'pat',
    durationMs: 816,
    anchors: [
      { letterIndex: 0, label: 'p', timeMs: 98 },
      { letterIndex: 1, label: 'a', timeMs: 367 },
      { letterIndex: 2, label: 't', timeMs: 669 },
    ],
  },
  {
    wordId: 'sap',
    durationMs: 768,
    anchors: [
      { letterIndex: 0, label: 's', timeMs: 92 },
      { letterIndex: 1, label: 'a', timeMs: 346 },
      { letterIndex: 2, label: 'p', timeMs: 630 },
    ],
  },
  {
    wordId: 'sat',
    durationMs: 768,
    anchors: [
      { letterIndex: 0, label: 's', timeMs: 92 },
      { letterIndex: 1, label: 'a', timeMs: 346 },
      { letterIndex: 2, label: 't', timeMs: 630 },
    ],
  },
  {
    wordId: 'tap',
    durationMs: 600,
    anchors: [
      { letterIndex: 0, label: 't', timeMs: 72 },
      { letterIndex: 1, label: 'a', timeMs: 270 },
      { letterIndex: 2, label: 'p', timeMs: 492 },
    ],
  },
];

export const getWordAudioMetadata = (wordId: string): WordAudioMetadata | undefined =>
  WORD_AUDIO_METADATA.find((entry) => entry.wordId === wordId);

export const listWordAudioMetadata = (): WordAudioMetadata[] => WORD_AUDIO_METADATA;
