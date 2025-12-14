import { create } from 'zustand';
import { getAnimalById } from '../data/animals';
import { loadProgress, markWordComplete as persistWordComplete, resetProgress } from '../lib/progressStorage';

type AnimalId = string;
type WordId = string;

interface GameState {
  /** Currently selected animal for the lesson flow */
  currentAnimalId: AnimalId | null;

  /** Current word being practiced */
  currentWordId: WordId | null;

  /** Set the current animal and choose the starting word (first incomplete) */
  setCurrentAnimal: (animalId: AnimalId) => void;

  /** Explicitly set the current word ID */
  setCurrentWordId: (wordId: WordId) => void;

  /** IDs of words that have been fully completed (passed comprehension check) */
  completedWords: Set<WordId>;

  /** Mark a word as fully completed and persist progress */
  markWordCompleted: (wordId: WordId) => void;

  /** Get ordered word IDs for the given animal */
  getAnimalWordIds: (animalId: AnimalId) => WordId[];

  /** Get progress for an animal */
  getAnimalProgress: (animalId: AnimalId) => { completed: number; total: number };

  /** Get zero-based index of current word within the animal's word list, or -1 */
  getCurrentWordIndexForCurrentAnimal: () => number;

  /** Get total words for the current animal, or 0 */
  getTotalWordsForCurrentAnimal: () => number;

  /** Get the next word ID for the current animal, or null if at the end */
  getNextWordForCurrentAnimal: () => WordId | null;

  /** Get the first incomplete word ID for an animal, or null if all done */
  getFirstIncompleteWordForAnimal: (animalId: AnimalId) => WordId | null;

  /** Reset all completed words for an animal (used for "Play Again") */
  resetAnimalProgress: (animalId: AnimalId) => void;

  /** Reset all progress (localStorage and in-memory state) */
  resetAllProgress: () => void;

  /** Whether developer helpers (anchor overrides, etc.) are shown */
  devToolsEnabled: boolean;
  /** Toggle developer helpers */
  toggleDevTools: () => void;
  /** Explicitly set dev tools flag */
  setDevTools: (enabled: boolean) => void;
}

const initialCompletedWords = new Set<WordId>(loadProgress().completedWords);

export const useGameStore = create<GameState>((set, get) => ({
  currentAnimalId: null,
  currentWordId: null,
  completedWords: initialCompletedWords,
  devToolsEnabled: false,

  setCurrentAnimal: (animalId) => {
    const firstIncomplete = get().getFirstIncompleteWordForAnimal(animalId);
    set({
      currentAnimalId: animalId,
      currentWordId: firstIncomplete,
    });
  },

  setCurrentWordId: (wordId) =>
    set({
      currentWordId: wordId,
    }),

  markWordCompleted: (wordId) => {
    const { completedWords } = get();
    if (!completedWords.has(wordId)) {
      const nextCompleted = new Set(completedWords);
      nextCompleted.add(wordId);
      persistWordComplete(wordId);
      set({ completedWords: nextCompleted });
    }
  },

  getAnimalWordIds: (animalId) => {
    const animal = getAnimalById(animalId);
    return animal?.words ?? [];
  },

  getAnimalProgress: (animalId) => {
    const { completedWords } = get();
    const animal = getAnimalById(animalId);
    const allWords = animal?.words ?? [];
    const completed = allWords.filter((id) => completedWords.has(id)).length;
    return {
      completed,
      total: allWords.length,
    };
  },

  getCurrentWordIndexForCurrentAnimal: () => {
    const { currentAnimalId, currentWordId, getAnimalWordIds } = get();
    if (!currentAnimalId || !currentWordId) {
      return -1;
    }
    const words = getAnimalWordIds(currentAnimalId);
    return words.indexOf(currentWordId);
  },

  getTotalWordsForCurrentAnimal: () => {
    const { currentAnimalId, getAnimalWordIds } = get();
    if (!currentAnimalId) {
      return 0;
    }
    return getAnimalWordIds(currentAnimalId).length;
  },

  getNextWordForCurrentAnimal: () => {
    const {
      currentAnimalId,
      currentWordId,
      getAnimalWordIds,
      getFirstIncompleteWordForAnimal,
    } = get();
    if (!currentAnimalId) {
      return null;
    }
    const words = getAnimalWordIds(currentAnimalId);
    if (!words.length) {
      return null;
    }
    if (!currentWordId) {
      return getFirstIncompleteWordForAnimal(currentAnimalId);
    }
    const currentIndex = words.indexOf(currentWordId);
    if (currentIndex === -1) {
      return getFirstIncompleteWordForAnimal(currentAnimalId);
    }
    // For now, advance sequentially through the animal's word list.
    const nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      return null;
    }
    return words[nextIndex];
  },

  getFirstIncompleteWordForAnimal: (animalId) => {
    const { completedWords } = get();
    const animal = getAnimalById(animalId);
    if (!animal) return null;
    return animal.words.find((id) => !completedWords.has(id)) ?? null;
  },

  resetAnimalProgress: (animalId) => {
    const { completedWords } = get();
    const animal = getAnimalById(animalId);
    if (!animal) return;
    const nextCompleted = new Set(completedWords);
    animal.words.forEach((id) => nextCompleted.delete(id));
    // Do not clear storage here; ComprehensionCheck will write new progress as words are re-completed.
    set({ completedWords: nextCompleted });
  },

  resetAllProgress: () => {
    // Clear localStorage
    resetProgress();

    // Reset in-memory state
    set({
      completedWords: new Set<WordId>(),
      currentAnimalId: null,
      currentWordId: null,
    });
  },

  toggleDevTools: () =>
    set((state) => ({
      devToolsEnabled: !state.devToolsEnabled,
    })),

  setDevTools: (enabled) =>
    set({
      devToolsEnabled: enabled,
    }),
}));

/**
 * Hook to get word navigation info for the current animal.
 */
export const useWordNavigation = () => {
  const currentIndex = useGameStore((s) => s.getCurrentWordIndexForCurrentAnimal());
  const totalWords = useGameStore((s) => s.getTotalWordsForCurrentAnimal());

  return {
    currentIndex: currentIndex >= 0 ? currentIndex + 1 : 0,
    totalWords,
    hasNext: currentIndex >= 0 && currentIndex + 1 < totalWords,
    hasPrevious: currentIndex > 0,
  };
};
