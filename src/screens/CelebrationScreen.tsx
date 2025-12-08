import { useNavigate, useParams } from 'react-router-dom';
import { getAnimalById } from '../data/animals';
import { useGameStore } from '../stores/gameStore';

export const CelebrationScreen = () => {
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId: string }>();
  const resetAnimalProgress = useGameStore((state) => state.resetAnimalProgress);

  const animal = animalId ? getAnimalById(animalId) : undefined;

  const handleGoHome = () => {
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (animal) {
      resetAnimalProgress(animal.id);
      useGameStore.getState().setCurrentAnimal(animal.id);
      navigate(`/lesson/${animal.id}`);
    } else {
      navigate('/');
    }
  };

  if (!animal) {
    return (
      <div className="screen shell-screen">
        <main className="shell-screen__content">
          <p>Animal not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="screen celebration-screen">
      <div className="celebration-screen__confetti" aria-hidden="true" />
      <div className="celebration-screen__content">
        <div className="celebration-screen__animal" aria-hidden="true">
          {animal.emoji}
        </div>
        <h1 className="celebration-screen__title">Amazing job!</h1>
        <p className="celebration-screen__subtitle">
          {animal.name} can talk now!
        </p>

        <div className="celebration-screen__words">
          {animal.words.map((wordId) => (
            <span key={wordId} className="celebration-screen__word">
              {wordId}
            </span>
          ))}
        </div>

        <div className="celebration-screen__stars" aria-hidden="true">
          {'★★★★★'}
        </div>

        <div className="celebration-screen__actions">
          <button
            type="button"
            className="celebration-screen__button celebration-screen__button--primary"
            onClick={handleGoHome}
          >
            🏠 Go Home
          </button>
          <button
            type="button"
            className="celebration-screen__button"
            onClick={handlePlayAgain}
          >
            🔁 Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

