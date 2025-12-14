import { useNavigate, useParams } from 'react-router-dom';
import { getAnimalById } from '../data/animals';
import { getWordById } from '../data/words';
import { useGameStore } from '../stores/gameStore';
import { AnimalAvatar } from '../components/AnimalAvatar';
import { useAnimalState } from '../hooks/useAnimalState';

export const CelebrationScreen = () => {
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId: string }>();
  const resetAnimalProgress = useGameStore((state) => state.resetAnimalProgress);

  const animal = animalId ? getAnimalById(animalId) : undefined;
  const avatarState = useAnimalState(1, { isCelebrating: true });

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
        <AnimalAvatar animal={animal} state={avatarState} size="large" />
        <h1 className="celebration-screen__title">Amazing job!</h1>
        <p className="celebration-screen__subtitle">
          {animal.name} can talk now!
        </p>

        <div className="celebration-screen__words">
          {animal.words.map((wordId, index) => {
            const word = getWordById(wordId);
            return (
              <span
                key={wordId}
                className="celebration-screen__word"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {(word?.displayText ?? word?.text ?? wordId).toUpperCase()}
              </span>
            );
          })}
        </div>

        <div className="celebration-screen__stars" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={index} style={{ animationDelay: `${index * 120}ms` }}>
              ⭐
            </span>
          ))}
        </div>

        <div className="celebration-screen__actions">
          <button
            type="button"
            className="celebration-screen__button celebration-screen__button--primary celebration-screen__button--home"
            onClick={handleGoHome}
          >
            🏠 Go Home
          </button>
          <button
            type="button"
            className="celebration-screen__button celebration-screen__button--accent"
            onClick={handlePlayAgain}
          >
            🔁 Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
