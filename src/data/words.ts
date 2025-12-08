import { WordDefinition } from '../types/phoneme';

/**
 * Test words for the phonics app
 * Limited set for audio testing with improved phoneme recordings
 *
 * Phonemes needed: c(k), a, t, s, m, p, n
 */
export const WORDS: WordDefinition[] = [
  {
    id: 'cat',
    text: 'cat',
    displayText: 'cat',
    phase: 1,
  },
  {
    id: 'sat',
    text: 'sat',
    displayText: 'sat',
    phase: 1,
  },
  {
    id: 'mat',
    text: 'mat',
    displayText: 'mat',
    phase: 1,
  },
  {
    id: 'pat',
    text: 'pat',
    displayText: 'pat',
    phase: 1,
  },
  {
    id: 'tap',
    text: 'tap',
    displayText: 'tap',
    phase: 1,
  },
  {
    id: 'map',
    text: 'map',
    displayText: 'map',
    phase: 1,
  },
  {
    id: 'sap',
    text: 'sap',
    displayText: 'sap',
    phase: 1,
  },
  {
    id: 'can',
    text: 'can',
    displayText: 'can',
    phase: 1,
  },
  {
    id: 'man',
    text: 'man',
    displayText: 'man',
    phase: 1,
  },
  {
    id: 'pan',
    text: 'pan',
    displayText: 'pan',
    phase: 1,
  },
];

export const DEFAULT_LESSON_WORD_ID = 'cat';

/**
 * Get a word by ID
 */
export const getWordById = (id: string): WordDefinition | undefined =>
  WORDS.find((word) => word.id === id);

/**
 * Get all words for a specific phase
 */
export const getWordsByPhase = (phase: number): WordDefinition[] =>
  WORDS.filter((word) => word.phase === phase);

/**
 * Get all playable words (words with all audio available)
 * This imports dynamically to avoid circular deps
 */
export const getPlayableWords = async (): Promise<WordDefinition[]> => {
  const { canPlayWord } = await import('../lib/wordParser');
  return WORDS.filter((word) => canPlayWord(word.text));
};

/**
 * Get word index in the list
 */
export const getWordIndex = (id: string): number =>
  WORDS.findIndex((word) => word.id === id);

/**
 * Get next word in the list
 */
export const getNextWord = (currentId: string): WordDefinition | undefined => {
  const currentIndex = getWordIndex(currentId);
  if (currentIndex === -1) return WORDS[0];
  const nextIndex = (currentIndex + 1) % WORDS.length;
  return WORDS[nextIndex];
};

/**
 * Get previous word in the list
 */
export const getPreviousWord = (currentId: string): WordDefinition | undefined => {
  const currentIndex = getWordIndex(currentId);
  if (currentIndex === -1) return WORDS[0];
  const prevIndex = (currentIndex - 1 + WORDS.length) % WORDS.length;
  return WORDS[prevIndex];
};

/**
 * Total word count
 */
export const TOTAL_WORDS = WORDS.length;
