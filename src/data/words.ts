import { WordDefinition } from '../types/phoneme';

/**
 * Complete MVP word list: 50 words across 8 animals
 *
 * Phase 1: Short A words (Farm animals)
 * Phase 2: Short E, I, O, U words (Pond animals)
 */
export const WORDS: WordDefinition[] = [
  // ============================================================================
  // PHASE 1: SHORT A WORDS (Farm)
  // ============================================================================

  // --- Pig's words ---
  { id: 'sat', text: 'sat', displayText: 'sat', phase: 1 },
  { id: 'mat', text: 'mat', displayText: 'mat', phase: 1 },
  { id: 'pat', text: 'pat', displayText: 'pat', phase: 1 },
  { id: 'tap', text: 'tap', displayText: 'tap', phase: 1 },
  { id: 'map', text: 'map', displayText: 'map', phase: 1 },

  // --- Cow's words ---
  { id: 'sap', text: 'sap', displayText: 'sap', phase: 1 },
  { id: 'nap', text: 'nap', displayText: 'nap', phase: 1 },
  { id: 'cap', text: 'cap', displayText: 'cap', phase: 1 },
  { id: 'can', text: 'can', displayText: 'can', phase: 1 },
  { id: 'pan', text: 'pan', displayText: 'pan', phase: 1 },

  // --- Cat's words ---
  { id: 'cat', text: 'cat', displayText: 'cat', phase: 1 },
  { id: 'man', text: 'man', displayText: 'man', phase: 1 },
  { id: 'fan', text: 'fan', displayText: 'fan', phase: 1 },
  { id: 'ran', text: 'ran', displayText: 'ran', phase: 1 },
  { id: 'tan', text: 'tan', displayText: 'tan', phase: 1 },

  // --- Hen's words ---
  { id: 'rat', text: 'rat', displayText: 'rat', phase: 1 },
  { id: 'fat', text: 'fat', displayText: 'fat', phase: 1 },
  { id: 'hat', text: 'hat', displayText: 'hat', phase: 1 },
  { id: 'bat', text: 'bat', displayText: 'bat', phase: 1 },
  { id: 'van', text: 'van', displayText: 'van', phase: 1 },

  // ============================================================================
  // PHASE 2: SHORT E WORDS (Pond - Frog)
  // ============================================================================
  { id: 'pet', text: 'pet', displayText: 'pet', phase: 2 },
  { id: 'set', text: 'set', displayText: 'set', phase: 2 },
  { id: 'net', text: 'net', displayText: 'net', phase: 2 },
  { id: 'met', text: 'met', displayText: 'met', phase: 2 },
  { id: 'wet', text: 'wet', displayText: 'wet', phase: 2 },

  // ============================================================================
  // PHASE 2: SHORT I WORDS (Pond - Duck)
  // ============================================================================
  { id: 'sit', text: 'sit', displayText: 'sit', phase: 2 },
  { id: 'pit', text: 'pit', displayText: 'pit', phase: 2 },
  { id: 'fin', text: 'fin', displayText: 'fin', phase: 2 },
  { id: 'pin', text: 'pin', displayText: 'pin', phase: 2 },
  { id: 'win', text: 'win', displayText: 'win', phase: 2 },

  // ============================================================================
  // PHASE 2: SHORT O WORDS (Pond - Fish)
  // ============================================================================
  { id: 'pot', text: 'pot', displayText: 'pot', phase: 2 },
  { id: 'not', text: 'not', displayText: 'not', phase: 2 },
  { id: 'mop', text: 'mop', displayText: 'mop', phase: 2 },
  { id: 'top', text: 'top', displayText: 'top', phase: 2 },
  { id: 'hot', text: 'hot', displayText: 'hot', phase: 2 },

 // ============================================================================
  // PHASE 2: SHORT U WORDS (Pond - Turtle)
  // ============================================================================
  { id: 'cup', text: 'cup', displayText: 'cup', phase: 2 },
  { id: 'sun', text: 'sun', displayText: 'sun', phase: 2 },
  { id: 'fun', text: 'fun', displayText: 'fun', phase: 2 },
  { id: 'nut', text: 'nut', displayText: 'nut', phase: 2 },
  { id: 'cut', text: 'cut', displayText: 'cut', phase: 2 },
  { id: 'run', text: 'run', displayText: 'run', phase: 2 },
  { id: 'pup', text: 'pup', displayText: 'pup', phase: 2 },
  { id: 'mud', text: 'mud', displayText: 'mud', phase: 2 },
  { id: 'hut', text: 'hut', displayText: 'hut', phase: 2 },
  { id: 'bus', text: 'bus', displayText: 'bus', phase: 2 },
  // Additional short U words to reach the 50-word MVP target (Turtle extensions)
  { id: 'bug', text: 'bug', displayText: 'bug', phase: 2 },
  { id: 'hug', text: 'hug', displayText: 'hug', phase: 2 },
  { id: 'tub', text: 'tub', displayText: 'tub', phase: 2 },
  { id: 'sub', text: 'sub', displayText: 'sub', phase: 2 },
  { id: 'mug', text: 'mug', displayText: 'mug', phase: 2 },
];

export const DEFAULT_LESSON_WORD_ID = 'sat';

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
