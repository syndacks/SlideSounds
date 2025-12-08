export interface Animal {
  id: string;
  name: string;
  emoji: string;
  habitat: string;
  /**
   * Ordered list of word IDs for this animal's lesson.
   */
  words: string[];
}

export const ANIMALS: Animal[] = [
  {
    id: 'pig',
    name: 'Pig',
    emoji: '🐷',
    habitat: 'farm',
    words: ['sat', 'mat', 'pat', 'tap', 'map'],
  },
];

export function getAnimalById(id: string): Animal | undefined {
  return ANIMALS.find((animal) => animal.id === id);
}

