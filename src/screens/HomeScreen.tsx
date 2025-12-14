import { useNavigate } from 'react-router-dom';
import { ANIMALS } from '../data/animals';
import { useGameStore } from '../stores/gameStore';

/**
 * Calculate total progress across all animals.
 */
function useTotalProgress() {
  const getAnimalProgress = useGameStore((state) => state.getAnimalProgress);

  let totalCompleted = 0;
  let totalWords = 0;

  for (const animal of ANIMALS) {
    const progress = getAnimalProgress(animal.id);
    totalCompleted += progress.completed;
    totalWords += progress.total;
  }

  return { completed: totalCompleted, total: totalWords };
}

export const HomeScreen = () => {
  const navigate = useNavigate();
  const progress = useTotalProgress();
  const devToolsEnabled = useGameStore((state) => state.devToolsEnabled);
  const toggleDevTools = useGameStore((state) => state.toggleDevTools);

  // Calculate how many animals are fully complete
  const getAnimalProgress = useGameStore((state) => state.getAnimalProgress);
  const animalsComplete = ANIMALS.filter((animal) => {
    const p = getAnimalProgress(animal.id);
    return p.completed === p.total && p.total > 0;
  }).length;

  const handlePlay = () => {
    navigate('/habitats');
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all progress? This will erase all completed words and start fresh. This cannot be undone.'
    );

    if (confirmed) {
      useGameStore.getState().resetAllProgress();
    }
  };

  return (
    <div className="home-screen">
      <header className="home-screen__header">
        <h1 className="home-screen__title">Phonics Adventure</h1>
      </header>

      <main className="home-screen__content">
        <div className="home-screen__avatar">
          <div className="home-screen__avatar-icon" aria-hidden="true">
            🌟
          </div>
          <div className="home-screen__avatar-label">
            {animalsComplete} of {ANIMALS.length} animals helped!
          </div>
        </div>

        <div className="home-screen__progress">
          <div className="home-screen__progress-label">
            {progress.completed} of {progress.total} words learned
          </div>
          <div className="home-screen__progress-bar" aria-hidden="true">
            {/* Show up to 10 dots for visual progress */}
            {Array.from({ length: Math.min(10, progress.total) }).map((_, index) => {
              const threshold = (progress.total / 10) * (index + 1);
              const isFilled = progress.completed >= threshold;
              return (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={
                    isFilled
                      ? 'home-screen__progress-dot home-screen__progress-dot--filled'
                      : 'home-screen__progress-dot'
                  }
                />
              );
            })}
          </div>
        </div>

        <button className="home-screen__play-button" type="button" onClick={handlePlay}>
          🏠 PLAY!
        </button>

        <button
          className="home-screen__reset-button"
          type="button"
          onClick={handleReset}
        >
          🔄 Reset Progress
        </button>

        {import.meta.env.DEV && (
          <button
            className={`home-screen__dev-toggle${
              devToolsEnabled ? ' home-screen__dev-toggle--active' : ''
            }`}
            type="button"
            onClick={toggleDevTools}
          >
            🛠️ Dev Tools {devToolsEnabled ? 'On' : 'Off'}
          </button>
        )}
      </main>
    </div>
  );
};
