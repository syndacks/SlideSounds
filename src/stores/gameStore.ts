import { create } from 'zustand';
import { DEFAULT_LESSON_WORD_ID } from '../data/words';

interface GameState {
  currentWordId: string;
  setWordId: (wordId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentWordId: DEFAULT_LESSON_WORD_ID,
  setWordId: (wordId) => set({ currentWordId: wordId }),
}));
