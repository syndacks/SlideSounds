import { WordDefinition } from '../types/phoneme';

export const WORDS: WordDefinition[] = [
  {
    id: 'cat',
    text: 'cat',
    displayText: 'cat',
  },
];

export const DEFAULT_LESSON_WORD_ID = 'cat';

export const getWordById = (id: string): WordDefinition | undefined =>
  WORDS.find((word) => word.id === id);
