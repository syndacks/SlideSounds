import { useEffect, useRef, useState } from 'react';
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
import { useWordAudio } from '../hooks/useWordAudio';

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
  const [isListeningToWord, setIsListeningToWord] = useState(false);
  const playbackTimeoutRef = useRef<number | null>(null);

  const {
    hasAudio: hasWordAudio,
    duration: wordAudioDuration,
  } = useWordAudio(word);

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
    if (!currentWordId || isListeningToWord) return;
    setIsListeningToWord(true);

    const durationMs = Math.max(800, (wordAudioDuration ?? 1.1) * 1000 + 200);
    playbackTimeoutRef.current = window.setTimeout(() => {
      navigate(`/check/${currentWordId}`);
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        window.clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setScrubProgress(0);
    setIsListeningToWord(false);
    if (playbackTimeoutRef.current) {
      window.clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
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
        isWordAudioReady={hasWordAudio}
      />

      {tutorial.isVisible && <TutorialOverlay onDismiss={tutorial.dismiss} />}
    </div>
  );
};
