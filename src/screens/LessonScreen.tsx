import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScrubWord } from '../components/ScrubWord';
import { getWordById } from '../data/words';
import { useGameStore, useWordNavigation } from '../stores/gameStore';

export const LessonScreen = () => {
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId: string }>();

  const currentWordId = useGameStore((state) => state.currentWordId);
  const setCurrentAnimal = useGameStore((state) => state.setCurrentAnimal);

  const { currentIndex, totalWords } = useWordNavigation();
  const word = currentWordId ? getWordById(currentWordId) : undefined;

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
    navigate('/animals/farm');
  };

  const handleComplete = () => {
    if (!currentWordId) return;
    navigate(`/check/${currentWordId}`);
  };

  if (!word) {
    return (
      <div className="lesson-screen">
        <h1>Lesson</h1>
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
            Word {currentIndex || 1} of {totalWords || 5}
          </span>
        </div>
        <h1 className="lesson-screen__word">{word.displayText ?? word.text}</h1>
        {word.phase && (
          <span className="lesson-screen__phase">Phase {word.phase}</span>
        )}
      </header>

      <ScrubWord word={word} onComplete={handleComplete} />

      <footer className="lesson-screen__footer">
        <div className="lesson-screen__keyboard-hints">
          <span>Scrub the word to help Pig talk.</span>
        </div>
      </footer>
    </div>
  );
};
