import { create } from 'zustand';
import {
  DEFAULT_LESSON_WORD_ID,
  getNextWord,
  getPreviousWord,
  getWordIndex,
  TOTAL_WORDS,
} from '../data/words';

interface GameState {
  /** Current word being practiced */
  currentWordId: string;

  /** Set the current word */
  setWordId: (wordId: string) => void;

  /** Navigate to next word */
  nextWord: () => void;

  /** Navigate to previous word */
  previousWord: () => void;

  /** Get current word index (1-based for display) */
  getCurrentIndex: () => number;

  /** Total words available */
  totalWords: number;

  /** Whether the current word has been completed */
  wordCompleted: boolean;

  /** Mark current word as completed */
  markComplete: () => void;

  /** Reset completion state */
  resetCompletion: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentWordId: DEFAULT_LESSON_WORD_ID,
  totalWords: TOTAL_WORDS,
  wordCompleted: false,

  setWordId: (wordId) =>
    set({
      currentWordId: wordId,
      wordCompleted: false,
    }),

  nextWord: () => {
    const { currentWordId } = get();
    const next = getNextWord(currentWordId);
    if (next) {
      set({
        currentWordId: next.id,
        wordCompleted: false,
      });
    }
  },

  previousWord: () => {
    const { currentWordId } = get();
    const prev = getPreviousWord(currentWordId);
    if (prev) {
      set({
        currentWordId: prev.id,
        wordCompleted: false,
      });
    }
  },

  getCurrentIndex: () => {
    const { currentWordId } = get();
    return getWordIndex(currentWordId) + 1; // 1-based for display
  },

  markComplete: () => set({ wordCompleted: true }),

  resetCompletion: () => set({ wordCompleted: false }),
}));

/**
 * Hook to get word navigation info
 */
export const useWordNavigation = () => {
  const totalWords = useGameStore((s) => s.totalWords);
  const nextWord = useGameStore((s) => s.nextWord);
  const previousWord = useGameStore((s) => s.previousWord);
  const getCurrentIndex = useGameStore((s) => s.getCurrentIndex);

  return {
    currentIndex: getCurrentIndex(),
    totalWords,
    nextWord,
    previousWord,
    hasNext: getCurrentIndex() < totalWords,
    hasPrevious: getCurrentIndex() > 1,
  };
};
