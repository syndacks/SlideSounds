export interface ComprehensionCheck {
  wordId: string;
  /**
   * Two distractor word IDs that are similar to the target word.
   */
  distractors: string[];
}

export const COMPREHENSION_CHECKS: Record<string, ComprehensionCheck> = {
  sat: { wordId: 'sat', distractors: ['hat', 'mat'] },
  mat: { wordId: 'mat', distractors: ['sat', 'pat'] },
  pat: { wordId: 'pat', distractors: ['mat', 'cat'] },
  tap: { wordId: 'tap', distractors: ['map', 'cap'] },
  map: { wordId: 'map', distractors: ['tap', 'sap'] },
};

export function getCheckForWord(wordId: string): ComprehensionCheck | undefined {
  return COMPREHENSION_CHECKS[wordId];
}

