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
const CHECK_AUTO_PLAY_DELAY_MS = 1500;

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
    // Simple deterministic shuffle: just ensure correct answer is not always first.
    return ids.sort((a, b) => (a < b ? -1 : 1));
  }, [check]);

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

  if (!wordId || !check || !targetWord || !currentAnimal) {
    return (
      <div className="screen shell-screen">
        <header className="shell-screen__header">
          <button type="button" className="shell-screen__back" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="shell-screen__title">Which one?</h1>
        </header>
        <main className="shell-screen__content">
          <p>Check data not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="screen shell-screen">
      <header className="shell-screen__header">
        <button type="button" className="shell-screen__back" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="shell-screen__title">Word Check</h1>
      </header>

      <main className="shell-screen__content">
        <div className="check-screen__top">
          {currentAnimal && (
            <AnimalAvatar animal={currentAnimal} state={avatarState} size="medium" />
          )}
          <p className="check-screen__prompt">
            Which one is <span className="check-screen__word">&apos;{targetWord.text}&apos;</span>?
          </p>
        </div>

        <div className="check-screen__options">
          {options.map((optionId, index) => {
            const word = getWordById(optionId);
            if (!word) return null;

            const label = word.displayText ?? word.text;
            const displayWord = label.toUpperCase();
            const firstLetter = displayWord.charAt(0);
            const remainder = displayWord.slice(1);
            const image = word.image;

            const classes = ['check-option', `check-option--theme-${(index % 3) + 1}`];
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
                      {firstLetter}
                    </span>
                  )}
                </div>
                <span className="check-option__word" aria-hidden="true">
                  <span className="check-option__word-initial">{firstLetter}</span>
                  {remainder}
                </span>
                <span className="check-option__label">{label}</span>
                <span className="check-option__decor" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="check-screen__hear-again"
          disabled={!hasWordAudio}
          onClick={() => {
            void playWordAudio();
          }}
        >
          {isAudioLoading ? 'Loading audio…' : '🔊 Hear Again'}
        </button>
      </main>
    </div>
  );
};
