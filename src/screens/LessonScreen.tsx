import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScrubWord } from '../components/ScrubWord';
import { WordImageReveal } from '../components/WordImageReveal';
import { getWordById } from '../data/words';
import { getAnimalById } from '../data/animals';
import { getHabitatByAnimalId } from '../data/habitats';
import { AnimalAvatar } from '../components/AnimalAvatar';
import { useAnimalState } from '../hooks/useAnimalState';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { useTutorialState } from '../hooks/useTutorialState';
import { useGameStore, useWordNavigation } from '../stores/gameStore';
import { useWordAudio } from '../hooks/useWordAudio';
import { SpeakPromptCard } from '../components/SpeakPromptCard';
import { useSpeechRecognizer } from '../hooks/useSpeechRecognizer';

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
  const [lessonPhase, setLessonPhase] = useState<'listen' | 'scrub'>('listen');

  const {
    hasAudio: hasWordAudio,
    duration: wordAudioDuration,
  } = useWordAudio(word);

  const {
    supportsSpeech,
    status: speechStatus,
    partialTranscript,
    finalTranscript,
    matchStatus,
    errorMessage: speechError,
    startListening: startSpeech,
    stopListening: stopSpeech,
    reset: resetSpeech,
  } = useSpeechRecognizer({
    expectedUtterances: word ? [word.text] : [],
    language: 'en-US',
    autoStart: false,
    enabled: Boolean(word),
  });

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

  useEffect(() => {
    if (!word) return;
    setLessonPhase(supportsSpeech ? 'listen' : 'scrub');
    resetSpeech();
    return () => {
      stopSpeech();
    };
  }, [word?.id, supportsSpeech, resetSpeech, stopSpeech]);

  useEffect(() => {
    if (lessonPhase === 'listen' && matchStatus === 'match') {
      setLessonPhase('scrub');
      stopSpeech();
    }
  }, [lessonPhase, matchStatus, stopSpeech]);

  const handleBack = () => {
    const habitat = animalId ? getHabitatByAnimalId(animalId) : undefined;
    navigate(`/animals/${habitat?.id ?? 'farm'}`);
  };

  const handleComplete = () => {
    if (!currentWordId || isListeningToWord || lessonPhase !== 'scrub') return;
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

  const isWordComplete = isListeningToWord;
  const isScrubLocked = lessonPhase === 'listen';

  const handleSkipSpeechPhase = () => {
    setLessonPhase('scrub');
    stopSpeech();
  };

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
          
          {/* Small animal companion in corner - no longer the star */}
          {currentAnimal && (
            <div className="lesson-screen__companion">
              <AnimalAvatar animal={currentAnimal} state={avatarState} size="small" />
            </div>
          )}
          
          <span className="lesson-screen__progress">
            {currentIndex || 1} / {totalWords || 5}
          </span>
        </div>
      </header>

      {/* Word image is now the hero - mystery reveal system */}
      <div className="lesson-screen__reveal-wrapper">
        <WordImageReveal 
          word={word} 
          progress={scrubProgress} 
          isComplete={isWordComplete}
        />
      </div>

      {word && (
        <div className="lesson-screen__listen-section">
          <SpeakPromptCard
            word={word}
            status={speechStatus}
            supportsSpeech={supportsSpeech}
            matchStatus={matchStatus}
            partialTranscript={partialTranscript}
            finalTranscript={finalTranscript}
            errorMessage={speechError}
            onStartListening={startSpeech}
            onStopListening={stopSpeech}
            onSkip={handleSkipSpeechPhase}
            isUnlocked={!isScrubLocked}
          />
        </div>
      )}

      <ScrubWord
        word={word}
        onComplete={handleComplete}
        onProgressChange={setScrubProgress}
        onInteractionStart={tutorial.dismiss}
        isWordAudioReady={hasWordAudio}
        isLocked={isScrubLocked}
        lockMessage="Say the word to unlock the slider"
      />

      {tutorial.isVisible && <TutorialOverlay onDismiss={tutorial.dismiss} />}
    </div>
  );
};
