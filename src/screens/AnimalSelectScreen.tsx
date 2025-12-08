import { useNavigate, useParams } from 'react-router-dom';
import { getAnimalById } from '../data/animals';
import { useGameStore } from '../stores/gameStore';

export const AnimalSelectScreen = () => {
  const navigate = useNavigate();
  const { habitatId } = useParams<{ habitatId: string }>();

  const pig = getAnimalById('pig');
  const progress = useGameStore((state) =>
    pig ? state.getAnimalProgress(pig.id) : { completed: 0, total: 0 },
  );

  const handleBack = () => {
    navigate('/habitats');
  };

  const handleContinue = () => {
    if (pig) {
      // Set the current animal and let the lesson screen pick the right starting word.
      useGameStore.getState().setCurrentAnimal(pig.id);
      navigate(`/lesson/${pig.id}`);
    }
  };

  if (!habitatId) {
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

  if (!pig) {
    return (
      <div className="screen shell-screen">
        <header className="shell-screen__header">
          <button type="button" className="shell-screen__back" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="shell-screen__title">Animals</h1>
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
        <h1 className="shell-screen__title">The Farm</h1>
      </header>

      <main className="shell-screen__content">
        <div className="animal-card">
          <div className="animal-card__emoji" aria-hidden="true">
            {pig.emoji}
          </div>
          <div className="animal-card__name">{pig.name}</div>
          <div className="animal-card__progress">
            {progress.completed} / {progress.total || pig.words.length} words
          </div>
          <button
            type="button"
            className="animal-card__button"
            onClick={handleContinue}
          >
            Help {pig.name}
          </button>
        </div>
      </main>
    </div>
  );
};

