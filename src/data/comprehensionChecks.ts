export interface ComprehensionCheck {
  wordId: string;
  /**
   * Two distractor word IDs that are phonetically similar to the target word.
   * Distractors are chosen to test decoding (minimal pairs where possible).
   */
  distractors: string[];
}

/**
 * Comprehension checks for all 50 MVP words.
 * Each word has 2 phonetically similar distractors.
 */
export const COMPREHENSION_CHECKS: Record<string, ComprehensionCheck> = {
  // ============================================================================
  // PHASE 1: SHORT A WORDS (Farm)
  // ============================================================================

  // --- Pig's words (sat, mat, pat, tap, map) ---
  sat: { wordId: 'sat', distractors: ['mat', 'hat'] },
  mat: { wordId: 'mat', distractors: ['sat', 'pat'] },
  pat: { wordId: 'pat', distractors: ['mat', 'cat'] },
  tap: { wordId: 'tap', distractors: ['map', 'cap'] },
  map: { wordId: 'map', distractors: ['tap', 'cap'] },

  // --- Cow's words (sap, nap, cap, can, pan) ---
  sap: { wordId: 'sap', distractors: ['tap', 'map'] },
  nap: { wordId: 'nap', distractors: ['cap', 'tap'] },
  cap: { wordId: 'cap', distractors: ['tap', 'map'] },
  can: { wordId: 'can', distractors: ['pan', 'man'] },
  pan: { wordId: 'pan', distractors: ['can', 'man'] },

  // --- Cat's words (cat, man, fan, ran, tan) ---
  cat: { wordId: 'cat', distractors: ['sat', 'bat'] },
  man: { wordId: 'man', distractors: ['can', 'pan'] },
  fan: { wordId: 'fan', distractors: ['man', 'can'] },
  ran: { wordId: 'ran', distractors: ['man', 'tan'] },
  tan: { wordId: 'tan', distractors: ['ran', 'man'] },

  // --- Hen's words (rat, fat, hat, bat, van) ---
  rat: { wordId: 'rat', distractors: ['cat', 'sat'] },
  fat: { wordId: 'fat', distractors: ['cat', 'sat'] },
  hat: { wordId: 'hat', distractors: ['sat', 'cat'] },
  bat: { wordId: 'bat', distractors: ['cat', 'sat'] },
  van: { wordId: 'van', distractors: ['man', 'can'] },

  // ============================================================================
  // PHASE 2: SHORT E WORDS (Pond - Frog)
  // ============================================================================
  pet: { wordId: 'pet', distractors: ['set', 'net'] },
  set: { wordId: 'set', distractors: ['pet', 'wet'] },
  net: { wordId: 'net', distractors: ['pet', 'met'] },
  met: { wordId: 'met', distractors: ['net', 'wet'] },
  wet: { wordId: 'wet', distractors: ['set', 'pet'] },

  // ============================================================================
  // PHASE 2: SHORT I WORDS (Pond - Duck)
  // ============================================================================
  sit: { wordId: 'sit', distractors: ['pit', 'sat'] },
  pit: { wordId: 'pit', distractors: ['sit', 'pet'] },
  fin: { wordId: 'fin', distractors: ['pin', 'win'] },
  pin: { wordId: 'pin', distractors: ['fin', 'win'] },
  win: { wordId: 'win', distractors: ['pin', 'fin'] },

  // ============================================================================
  // PHASE 2: SHORT O WORDS (Pond - Fish)
  // ============================================================================
  pot: { wordId: 'pot', distractors: ['hot', 'not'] },
  not: { wordId: 'not', distractors: ['pot', 'hot'] },
  mop: { wordId: 'mop', distractors: ['top', 'map'] },
  top: { wordId: 'top', distractors: ['mop', 'tap'] },
  hot: { wordId: 'hot', distractors: ['pot', 'not'] },

  // ============================================================================
  // PHASE 2: SHORT U WORDS (Pond - Turtle)
  // ============================================================================
  cup: { wordId: 'cup', distractors: ['pup', 'cut'] },
  sun: { wordId: 'sun', distractors: ['run', 'fun'] },
  fun: { wordId: 'fun', distractors: ['sun', 'run'] },
  nut: { wordId: 'nut', distractors: ['cut', 'hut'] },
  cut: { wordId: 'cut', distractors: ['nut', 'cup'] },
  run: { wordId: 'run', distractors: ['sun', 'fun'] },
  pup: { wordId: 'pup', distractors: ['cup', 'cut'] },
  mud: { wordId: 'mud', distractors: ['hut', 'nut'] },
  hut: { wordId: 'hut', distractors: ['nut', 'cut'] },
  bus: { wordId: 'bus', distractors: ['sun', 'pup'] },
};

export function getCheckForWord(wordId: string): ComprehensionCheck | undefined {
  return COMPREHENSION_CHECKS[wordId];
}

/**
 * Get all comprehension checks for a list of word IDs
 */
export function getChecksForWords(wordIds: string[]): ComprehensionCheck[] {
  return wordIds
    .map((id) => COMPREHENSION_CHECKS[id])
    .filter((check): check is ComprehensionCheck => check !== undefined);
}
