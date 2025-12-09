import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScrubWord } from '../components/ScrubWord';
import { getWordById } from '../data/words';
import { getAnimalById } from '../data/animals';
import { getHabitatByAnimalId } from '../data/habitats';
import { AnimalAvatar } from '../components/AnimalAvatar';
import { useAnimalState } from '../hooks/useAnimalState';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { useTutorialState } from '../hooks/useTutorialState';
import { useGameStore, useWordNavigation } from '../stores/gameStore';

export const LessonScreen = () => {
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId: string }>();

  const currentWordId = useGameStore((state) => state.currentWordId);
  const setCurrentAnimal = useGameStore((state) => state.setCurrentAnimal);

  const { currentIndex, totalWords } = useWordNavigation();
  const word = currentWordId ? getWordById(currentWordId) : undefined;
  const currentAnimal = animalId ? getAnimalById(animalId) : undefined;
  const [scrubProgress, setScrubProgress] = useState(0);
  const avatarState = useAnimalState(scrubProgress);
  const tutorial = useTutorialState();

  useEffect(() => {
    if (!animalId) {
      navigate('/');
      return;
    }
    setCurrentAnimal(animalId);
  }, [animalId, navigate, setCurrentAnimal]);

  useEffect(() => {
    if (!animalId) return;
    if (!currentWordId) {
      navigate(`/celebration/${animalId}`);
    }
  }, [animalId, currentWordId, navigate]);

  const handleBack = () => {
    const habitat = animalId ? getHabitatByAnimalId(animalId) : undefined;
    navigate(`/animals/${habitat?.id ?? 'farm'}`);
  };

  const handleComplete = () => {
    if (!currentWordId) return;
    navigate(`/check/${currentWordId}`);
  };

  useEffect(() => {
    setScrubProgress(0);
  }, [word?.id]);

  if (!word) {
    return (
      <div className="lesson-screen">
        <p>Word not found.</p>
      </div>
    );
  }

  return (
    <div className="lesson-screen">
      <header className="lesson-screen__header">
        <div className="lesson-screen__nav">
          <button
            type="button"
            className="lesson-screen__nav-btn"
            onClick={handleBack}
            aria-label="Back to animals"
          >
            ← Back
          </button>
          <span className="lesson-screen__progress">
            {currentIndex || 1} / {totalWords || 5}
          </span>
        </div>
      </header>

      {currentAnimal && (
        <div className="lesson-screen__avatar-wrapper">
          <AnimalAvatar animal={currentAnimal} state={avatarState} size="large" />
        </div>
      )}

      <ScrubWord
        word={word}
        onComplete={handleComplete}
        onProgressChange={setScrubProgress}
        onInteractionStart={tutorial.dismiss}
      />

      {tutorial.isVisible && <TutorialOverlay onDismiss={tutorial.dismiss} />}
    </div>
  );
};
