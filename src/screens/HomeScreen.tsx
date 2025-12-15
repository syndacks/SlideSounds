import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ANIMALS } from '../data/animals';
import { useGameStore } from '../stores/gameStore';
import { ResetProgressDialog } from '../components/ResetProgressDialog';

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
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
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
    setResetDialogOpen(true);
  };

  const handleDismissResetDialog = () => {
    setResetDialogOpen(false);
  };

  const handleConfirmReset = () => {
    useGameStore.getState().resetAllProgress();
    setResetDialogOpen(false);
  };

  // Generate animal emojis for visual progress
  const animalEmojis = ANIMALS.slice(0, 8).map((animal) => {
    const p = getAnimalProgress(animal.id);
    const isComplete = p.completed === p.total && p.total > 0;
    return { id: animal.id, emoji: animal.emoji, isComplete };
  });

  return (
    <div className="home-screen">
      {/* Title - kept simple */}
      <header className="home-screen__header">
        <h1 className="home-screen__title">Phonics Adventure</h1>
      </header>

      <main className="home-screen__content">
        {/* Visual progress - animal faces showing completion */}
        <div className="home-screen__animal-progress">
          {animalEmojis.map((animal, index) => (
            <span
              key={animal.id}
              className={`home-screen__animal-icon ${
                animal.isComplete ? 'home-screen__animal-icon--complete' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              aria-label={animal.isComplete ? 'Completed' : 'Not completed'}
            >
              {animal.emoji}
            </span>
          ))}
        </div>

        {/* Progress summary - visual dots, minimal text */}
        <div className="home-screen__progress">
          <div className="home-screen__progress-bar" aria-hidden="true">
            {Array.from({ length: Math.min(10, progress.total || 10) }).map((_, index) => {
              const threshold = ((progress.total || 50) / 10) * (index + 1);
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
          <div className="home-screen__progress-label">
            {animalsComplete > 0 ? (
              <span>
                {animalsComplete} of {ANIMALS.length} friends helped! 🎉
              </span>
            ) : (
              <span>Help the animals learn to talk!</span>
            )}
          </div>
        </div>

        {/* HERO: Big Play Button */}
        <button className="home-screen__play-button" type="button" onClick={handlePlay}>
          <span className="home-screen__play-icon" aria-hidden="true">🎮</span>
          <span className="home-screen__play-text">PLAY!</span>
        </button>

        {/* Secondary actions - smaller, less prominent */}
        <div className="home-screen__secondary-actions">
          <button
            className="home-screen__reset-button"
            type="button"
            onClick={handleReset}
          >
            🔄 Reset
          </button>

          {import.meta.env.DEV && (
            <button
              className={`home-screen__dev-toggle${
                devToolsEnabled ? ' home-screen__dev-toggle--active' : ''
              }`}
              type="button"
              onClick={toggleDevTools}
            >
              🛠️ {devToolsEnabled ? 'On' : 'Off'}
            </button>
          )}
        </div>
      </main>

      <ResetProgressDialog
        isOpen={isResetDialogOpen}
        onCancel={handleDismissResetDialog}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
};
