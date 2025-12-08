export interface Habitat {
  id: string;
  name: string;
  emoji: string;
  /**
   * IDs of animals that belong to this habitat.
   */
  animals: string[];
}

export const HABITATS: Habitat[] = [
  {
    id: 'farm',
    name: 'The Farm',
    emoji: '🌾',
    animals: ['pig'],
  },
];

export function getHabitatById(id: string): Habitat | undefined {
  return HABITATS.find((habitat) => habitat.id === id);
}

