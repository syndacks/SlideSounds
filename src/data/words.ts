import { WordDefinition } from '../types/phoneme';

/**
 * Test words for the phonics app
 * Organized by phase and phoneme complexity
 *
 * Phase 1: m, s, a, t, p (short a only)
 * Phase 2: adds f, n, c, r (still short a)
 * Phase 3: all short vowels (e, i, o, u)
 */
export const WORDS: WordDefinition[] = [
  // ============================================================================
  // PHASE 1: m, s, a, t, p words (CVC with short a)
  // ============================================================================
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

  // ============================================================================
  // PHASE 2: adds f, n, c, r words (CVC with short a)
  // ============================================================================
  {
    id: 'cat',
    text: 'cat',
    displayText: 'cat',
    phase: 2,
  },
  {
    id: 'can',
    text: 'can',
    displayText: 'can',
    phase: 2,
  },
  {
    id: 'man',
    text: 'man',
    displayText: 'man',
    phase: 2,
  },
  {
    id: 'fan',
    text: 'fan',
    displayText: 'fan',
    phase: 2,
  },
  {
    id: 'ran',
    text: 'ran',
    displayText: 'ran',
    phase: 2,
  },
  {
    id: 'pan',
    text: 'pan',
    displayText: 'pan',
    phase: 2,
  },
  {
    id: 'rat',
    text: 'rat',
    displayText: 'rat',
    phase: 2,
  },
  {
    id: 'nap',
    text: 'nap',
    displayText: 'nap',
    phase: 2,
  },
  {
    id: 'fat',
    text: 'fat',
    displayText: 'fat',
    phase: 2,
  },
  {
    id: 'tan',
    text: 'tan',
    displayText: 'tan',
    phase: 2,
  },

  // ============================================================================
  // PHASE 3: Short E words
  // ============================================================================
  {
    id: 'pet',
    text: 'pet',
    displayText: 'pet',
    phase: 3,
  },
  {
    id: 'set',
    text: 'set',
    displayText: 'set',
    phase: 3,
  },
  {
    id: 'net',
    text: 'net',
    displayText: 'net',
    phase: 3,
  },
  {
    id: 'men',
    text: 'men',
    displayText: 'men',
    phase: 3,
  },
  {
    id: 'hen',
    text: 'hen',
    displayText: 'hen',
    phase: 3,
  },
  {
    id: 'red',
    text: 'red',
    displayText: 'red',
    phase: 3,
  },
  {
    id: 'bed',
    text: 'bed',
    displayText: 'bed',
    phase: 3,
  },

  // ============================================================================
  // PHASE 3: Short I words
  // ============================================================================
  {
    id: 'sit',
    text: 'sit',
    displayText: 'sit',
    phase: 3,
  },
  {
    id: 'pit',
    text: 'pit',
    displayText: 'pit',
    phase: 3,
  },
  {
    id: 'fin',
    text: 'fin',
    displayText: 'fin',
    phase: 3,
  },
  {
    id: 'pin',
    text: 'pin',
    displayText: 'pin',
    phase: 3,
  },
  {
    id: 'tin',
    text: 'tin',
    displayText: 'tin',
    phase: 3,
  },
  {
    id: 'hit',
    text: 'hit',
    displayText: 'hit',
    phase: 3,
  },
  {
    id: 'bit',
    text: 'bit',
    displayText: 'bit',
    phase: 3,
  },

  // ============================================================================
  // PHASE 3: Short O words
  // ============================================================================
  {
    id: 'pot',
    text: 'pot',
    displayText: 'pot',
    phase: 3,
  },
  {
    id: 'not',
    text: 'not',
    displayText: 'not',
    phase: 3,
  },
  {
    id: 'mop',
    text: 'mop',
    displayText: 'mop',
    phase: 3,
  },
  {
    id: 'top',
    text: 'top',
    displayText: 'top',
    phase: 3,
  },
  {
    id: 'hot',
    text: 'hot',
    displayText: 'hot',
    phase: 3,
  },
  {
    id: 'got',
    text: 'got',
    displayText: 'got',
    phase: 3,
  },
  {
    id: 'dot',
    text: 'dot',
    displayText: 'dot',
    phase: 3,
  },

  // ============================================================================
  // PHASE 3: Short U words
  // ============================================================================
  {
    id: 'cup',
    text: 'cup',
    displayText: 'cup',
    phase: 3,
  },
  {
    id: 'sun',
    text: 'sun',
    displayText: 'sun',
    phase: 3,
  },
  {
    id: 'fun',
    text: 'fun',
    displayText: 'fun',
    phase: 3,
  },
  {
    id: 'nut',
    text: 'nut',
    displayText: 'nut',
    phase: 3,
  },
  {
    id: 'cut',
    text: 'cut',
    displayText: 'cut',
    phase: 3,
  },
  {
    id: 'run',
    text: 'run',
    displayText: 'run',
    phase: 3,
  },
  {
    id: 'pup',
    text: 'pup',
    displayText: 'pup',
    phase: 3,
  },
  {
    id: 'mud',
    text: 'mud',
    displayText: 'mud',
    phase: 3,
  },
  {
    id: 'hut',
    text: 'hut',
    displayText: 'hut',
    phase: 3,
  },
  {
    id: 'bus',
    text: 'bus',
    displayText: 'bus',
    phase: 3,
  },
  {
    id: 'bud',
    text: 'bud',
    displayText: 'bud',
    phase: 3,
  },
  {
    id: 'dug',
    text: 'dug',
    displayText: 'dug',
    phase: 3,
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
