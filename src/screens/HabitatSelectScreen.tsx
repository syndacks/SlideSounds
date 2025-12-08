import { useNavigate } from 'react-router-dom';
import { HABITATS } from '../data/habitats';
import { getPigAnimal, useGameStore } from '../stores/gameStore';

export const HabitatSelectScreen = () => {
  const navigate = useNavigate();
  const pig = getPigAnimal();
  const progress = useGameStore((state) =>
    pig ? state.getAnimalProgress(pig.id) : { completed: 0, total: 0 },
  );

  const farm = HABITATS[0];

  const handleBack = () => {
    navigate('/');
  };

  const handleEnterHabitat = () => {
    navigate(`/animals/${farm.id}`);
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
        <button
          type="button"
          className="habitat-card"
          onClick={handleEnterHabitat}
          aria-label={`Enter ${farm.name}`}
        >
          <div className="habitat-card__emoji" aria-hidden="true">
            {farm.emoji}
          </div>
          <div className="habitat-card__name">{farm.name}</div>
          <div className="habitat-card__progress">
            {progress.completed} / {progress.total || 5} words
          </div>
        </button>
      </main>
    </div>
  );
};

