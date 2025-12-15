import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCheckForWord } from '../data/comprehensionChecks';
import { getWordById } from '../data/words';
import { getAnimalById } from '../data/animals';
import { useGameStore } from '../stores/gameStore';
import { useWordAudio } from '../hooks/useWordAudio';
import { AnimalAvatar } from '../components/AnimalAvatar';
import { useAnimalState } from '../hooks/useAnimalState';

type OptionState = 'idle' | 'selecting' | 'correct' | 'incorrect';
const CHECK_AUTO_PLAY_DELAY_MS = 800;

export const ComprehensionCheckScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wordId } = useParams<{ wordId: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [optionState, setOptionState] = useState<OptionState>('idle');
  const [incorrectSelections, setIncorrectSelections] = useState<Set<string>>(
    () => new Set(),
  );

  const currentAnimalId = useGameStore((state) => state.currentAnimalId);
  const currentAnimal = currentAnimalId ? getAnimalById(currentAnimalId) : undefined;
  const markWordCompleted = useGameStore((state) => state.markWordCompleted);
  const getNextWordForCurrentAnimal = useGameStore(
    (state) => state.getNextWordForCurrentAnimal,
  );

  const check = wordId ? getCheckForWord(wordId) : undefined;
  const targetWord = wordId ? getWordById(wordId) : undefined;
  const { play: playWordAudio, isLoading: isAudioLoading, hasAudio: hasWordAudio } =
    useWordAudio(targetWord, {
      autoPlayOnReady: true,
      autoPlayDelay: CHECK_AUTO_PLAY_DELAY_MS,
      autoPlaySessionKey: location.key,
    });
  const avatarState = useAnimalState(1);

  useEffect(() => {
    setIncorrectSelections(new Set<string>());
    setSelectedId(null);
    setOptionState('idle');
  }, [wordId]);

  const options = useMemo(() => {
    if (!check) return [];
    const ids = [check.wordId, ...check.distractors];
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [check, location.key]);

  const handleBack = () => {
    if (currentAnimal) {
      navigate(`/lesson/${currentAnimal.id}`);
    } else {
      navigate('/');
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (!check || !currentAnimal || optionState === 'correct' || optionState === 'selecting') return;
    setSelectedId(optionId);
    setOptionState('selecting');

    if (optionId === check.wordId) {
      setOptionState('correct');
      markWordCompleted(check.wordId);

      const nextId = getNextWordForCurrentAnimal();
      window.setTimeout(() => {
        if (nextId) {
          useGameStore.getState().setCurrentWordId(nextId);
          navigate(`/lesson/${currentAnimal.id}`);
        } else {
          navigate(`/celebration/${currentAnimal.id}`);
        }
      }, 1000);
      return;
    }

    setOptionState('incorrect');
    setIncorrectSelections((prev) => {
      const next = new Set(prev);
      next.add(optionId);
      return next;
    });
    // Allow the child to try again; reset state after a moment.
    window.setTimeout(() => {
      setOptionState('idle');
      setSelectedId(null);
    }, 800);
  };

  const handleTargetWordClick = () => {
    if (hasWordAudio && !isAudioLoading) {
      void playWordAudio();
    }
  };

  if (!wordId || !check || !targetWord || !currentAnimal) {
    return (
      <div className="screen check-screen">
        <header className="check-screen__header">
          <button type="button" className="check-screen__back-btn" onClick={handleBack}>
            ← Back
          </button>
        </header>
        <main className="check-screen__body">
          <p>Check data not found.</p>
        </main>
      </div>
    );
  }

  const targetWordDisplay = (targetWord.displayText ?? targetWord.text).toUpperCase();

  return (
    <div className="screen check-screen">
      {/* Minimal header - just back button and small companion */}
      <header className="check-screen__header">
        <button type="button" className="check-screen__back-btn" onClick={handleBack}>
          ←
        </button>
        
        {/* Small companion in corner */}
        {currentAnimal && (
          <div className="check-screen__companion">
            <AnimalAvatar animal={currentAnimal} state={avatarState} size="small" />
          </div>
        )}
      </header>

      <main className="check-screen__body">
        {/* Target Word Card - The hero element */}
        <button 
          type="button"
          className="check-screen__target-card"
          onClick={handleTargetWordClick}
          disabled={!hasWordAudio || isAudioLoading}
          aria-label={`Hear the word ${targetWord.text}`}
        >
          <span className="check-screen__target-speaker" aria-hidden="true">
            {isAudioLoading ? '⏳' : '🔊'}
          </span>
          <span className="check-screen__target-word">
            {targetWordDisplay}
          </span>
          <span className="check-screen__target-hint">
            Tap to hear
          </span>
        </button>

        {/* Simple visual prompt */}
        <div className="check-screen__prompt">
          <span className="check-screen__prompt-text">Find it!</span>
          <span className="check-screen__prompt-arrow" aria-hidden="true">👇</span>
        </div>

        {/* Option cards */}
        <div className="check-screen__options">
          {options.map((optionId) => {
            const word = getWordById(optionId);
            if (!word) return null;

            const label = word.displayText ?? word.text;
            const image = word.image;

            const classes = ['check-option'];
            const isSelected = selectedId === optionId;

            if (isSelected && optionState === 'selecting') {
              classes.push('check-option--selecting');
            }
            if (isSelected && optionState === 'correct') {
              classes.push('check-option--correct');
            }
            if (isSelected && optionState === 'incorrect') {
              classes.push('check-option--incorrect');
            }

            const isDimmed =
              incorrectSelections.has(optionId) ||
              (optionState === 'correct' && optionId !== check.wordId);
            if (isDimmed) {
              classes.push('check-option--dimmed');
            }
            const shouldDisable = isDimmed || optionState === 'correct';

            return (
              <button
                key={optionId}
                type="button"
                className={classes.join(' ')}
                disabled={shouldDisable}
                onClick={() => handleOptionClick(optionId)}
              >
                <span className="check-option__status-icon" aria-hidden="true">
                  ✓
                </span>
                <div
                  className={`check-option__image-wrapper${
                    image ? '' : ' check-option__image-wrapper--placeholder'
                  }`}
                >
                  {image ? (
                    <img
                      className="check-option__image"
                      src={image.src}
                      alt={image.alt ?? `Illustration for the word ${label}`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="check-option__image-fallback" aria-hidden="true">
                      {label.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="check-option__word">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
