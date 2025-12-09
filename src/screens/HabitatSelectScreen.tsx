import { useNavigate } from 'react-router-dom';
import { HABITATS, Habitat } from '../data/habitats';
import { useGameStore } from '../stores/gameStore';

/**
 * Calculate total progress for a habitat by summing all animal progress.
 */
function useHabitatProgress(habitat: Habitat) {
  const getAnimalProgress = useGameStore((state) => state.getAnimalProgress);

  let totalCompleted = 0;
  let totalWords = 0;

  for (const animalId of habitat.animals) {
    const progress = getAnimalProgress(animalId);
    totalCompleted += progress.completed;
    totalWords += progress.total;
  }

  return { completed: totalCompleted, total: totalWords };
}

interface HabitatCardProps {
  habitat: Habitat;
  onEnter: () => void;
}

const HabitatCard = ({ habitat, onEnter }: HabitatCardProps) => {
  const progress = useHabitatProgress(habitat);

  return (
    <button
      type="button"
      className="habitat-card"
      onClick={onEnter}
      aria-label={`Enter ${habitat.name}`}
    >
      <div className="habitat-card__emoji" aria-hidden="true">
        {habitat.emoji}
      </div>
      <div className="habitat-card__name">{habitat.name}</div>
      <div className="habitat-card__description">{habitat.description}</div>
      <div className="habitat-card__progress">
        {progress.completed} / {progress.total} words
      </div>
    </button>
  );
};

export const HabitatSelectScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleEnterHabitat = (habitatId: string) => {
    navigate(`/animals/${habitatId}`);
  };

  return (
    <div className="screen shell-screen">
      <header className="shell-screen__header">
        <button type="button" className="shell-screen__back" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="shell-screen__title">Choose a Place</h1>
      </header>

      <main className="shell-screen__content">
        <div className="habitat-grid">
          {HABITATS.map((habitat) => (
            <HabitatCard
              key={habitat.id}
              habitat={habitat}
              onEnter={() => handleEnterHabitat(habitat.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
