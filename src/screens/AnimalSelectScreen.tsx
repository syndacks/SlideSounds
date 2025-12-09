import { useNavigate, useParams } from 'react-router-dom';
import { Animal, getAnimalsByHabitat } from '../data/animals';
import { getHabitatById } from '../data/habitats';
import { useGameStore } from '../stores/gameStore';

interface AnimalCardProps {
  animal: Animal;
  onSelect: () => void;
}

const AnimalCard = ({ animal, onSelect }: AnimalCardProps) => {
  const progress = useGameStore((state) => state.getAnimalProgress(animal.id));
  const isComplete = progress.completed === progress.total && progress.total > 0;

  return (
    <div className={`animal-card ${isComplete ? 'animal-card--complete' : ''}`}>
      <div className="animal-card__emoji" aria-hidden="true">
        {animal.emoji}
      </div>
      <div className="animal-card__name">{animal.name}</div>
      <div className="animal-card__progress">
        {progress.completed} / {progress.total} words
        {isComplete && <span className="animal-card__badge">✓</span>}
      </div>
      <button
        type="button"
        className="animal-card__button"
        onClick={onSelect}
      >
        {isComplete ? 'Review' : progress.completed > 0 ? 'Continue' : 'Start'}
      </button>
    </div>
  );
};

export const AnimalSelectScreen = () => {
  const navigate = useNavigate();
  const { habitatId } = useParams<{ habitatId: string }>();

  const habitat = habitatId ? getHabitatById(habitatId) : undefined;
  const animals = habitatId ? getAnimalsByHabitat(habitatId) : [];

  const handleBack = () => {
    navigate('/habitats');
  };

  const handleSelectAnimal = (animalId: string) => {
    // Set the current animal and navigate to lesson
    useGameStore.getState().setCurrentAnimal(animalId);
    navigate(`/lesson/${animalId}`);
  };

  if (!habitatId || !habitat) {
    return (
      <div className="screen shell-screen">
        <header className="shell-screen__header">
          <button type="button" className="shell-screen__back" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="shell-screen__title">Animals</h1>
        </header>
        <main className="shell-screen__content">
          <p>Habitat not found.</p>
        </main>
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="screen shell-screen">
        <header className="shell-screen__header">
          <button type="button" className="shell-screen__back" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="shell-screen__title">{habitat.name}</h1>
        </header>
        <main className="shell-screen__content">
          <p>No animals found for this habitat yet.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="screen shell-screen">
      <header className="shell-screen__header">
        <button type="button" className="shell-screen__back" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="shell-screen__title">
          {habitat.emoji} {habitat.name}
        </h1>
      </header>

      <main className="shell-screen__content">
        <p className="animal-select__prompt">Who needs help today?</p>

        <div className="animal-grid">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onSelect={() => handleSelectAnimal(animal.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
