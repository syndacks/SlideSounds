export interface Habitat {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /**
   * IDs of animals that belong to this habitat.
   */
  animals: string[];
  /**
   * Phase number this habitat corresponds to in the curriculum.
   */
  phase: number;
}

export const HABITATS: Habitat[] = [
  {
    id: 'farm',
    name: 'The Farm',
    emoji: '🌾',
    description: 'Help the farm animals find their voices!',
    animals: ['pig', 'cow', 'cat', 'hen'],
    phase: 1,
  },
  {
    id: 'pond',
    name: 'The Pond',
    emoji: '🌊',
    description: 'Visit the pond and meet new friends!',
    animals: ['frog', 'duck', 'fish', 'turtle'],
    phase: 2,
  },
];

export function getHabitatById(id: string): Habitat | undefined {
  return HABITATS.find((habitat) => habitat.id === id);
}

export function getHabitatByAnimalId(animalId: string): Habitat | undefined {
  return HABITATS.find((habitat) => habitat.animals.includes(animalId));
}
