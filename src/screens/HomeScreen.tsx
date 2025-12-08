import { useNavigate } from 'react-router-dom';
import { getPigAnimal, useGameStore } from '../stores/gameStore';

export const HomeScreen = () => {
  const navigate = useNavigate();
  const pig = getPigAnimal();
  const progress = useGameStore((state) =>
    pig ? state.getAnimalProgress(pig.id) : { completed: 0, total: 0 },
  );

  const handlePlay = () => {
    navigate('/habitats');
  };

  return (
    <div className="home-screen">
      <header className="home-screen__header">
        <h1 className="home-screen__title">Phonics Adventure</h1>
      </header>

      <main className="home-screen__content">
        <div className="home-screen__avatar">
          <div className="home-screen__avatar-icon" aria-hidden="true">
            🐷
          </div>
          <div className="home-screen__avatar-label">Pig&apos;s Farm</div>
        </div>

        <div className="home-screen__progress">
          <div className="home-screen__progress-label">
            {progress.completed} of {progress.total || 5} words learned
          </div>
          <div className="home-screen__progress-bar" aria-hidden="true">
            {Array.from({ length: progress.total || 5 }).map((_, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={
                  index < progress.completed
                    ? 'home-screen__progress-dot home-screen__progress-dot--filled'
                    : 'home-screen__progress-dot'
                }
              />
            ))}
          </div>
        </div>

        <button className="home-screen__play-button" type="button" onClick={handlePlay}>
          🏠 PLAY!
        </button>
      </main>
    </div>
  );
};

