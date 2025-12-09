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
  // ============================================================================
  // FARM ANIMALS (Phase 0-1: Short A words)
  // ============================================================================
  {
    id: 'pig',
    name: 'Pig',
    emoji: '🐷',
    habitat: 'farm',
    words: ['sat', 'mat', 'pat', 'tap', 'map'],
  },
  {
    id: 'cow',
    name: 'Cow',
    emoji: '🐄',
    habitat: 'farm',
    words: ['sap', 'nap', 'cap', 'can', 'pan'],
  },
  {
    id: 'cat',
    name: 'Cat',
    emoji: '🐱',
    habitat: 'farm',
    words: ['cat', 'man', 'fan', 'ran', 'tan'],
  },
  {
    id: 'hen',
    name: 'Hen',
    emoji: '🐔',
    habitat: 'farm',
    words: ['rat', 'fat', 'hat', 'bat', 'van'],
  },

  // ============================================================================
  // POND ANIMALS (Phase 2: Short E, I, O, U words)
  // ============================================================================
  {
    id: 'frog',
    name: 'Frog',
    emoji: '🐸',
    habitat: 'pond',
    words: ['pet', 'set', 'net', 'met', 'wet'],
  },
  {
    id: 'duck',
    name: 'Duck',
    emoji: '🦆',
    habitat: 'pond',
    words: ['sit', 'pit', 'fin', 'pin', 'win'],
  },
  {
    id: 'fish',
    name: 'Fish',
    emoji: '🐟',
    habitat: 'pond',
    words: ['pot', 'not', 'mop', 'top', 'hot'],
  },
  {
    id: 'turtle',
    name: 'Turtle',
    emoji: '🐢',
    habitat: 'pond',
    words: ['cup', 'sun', 'fun', 'nut', 'cut', 'run', 'pup', 'mud', 'hut', 'bus'],
  },
];

export function getAnimalById(id: string): Animal | undefined {
  return ANIMALS.find((animal) => animal.id === id);
}

export function getAnimalsByHabitat(habitatId: string): Animal[] {
  return ANIMALS.filter((animal) => animal.habitat === habitatId);
}
