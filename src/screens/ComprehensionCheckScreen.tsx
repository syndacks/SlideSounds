import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCheckForWord } from '../data/comprehensionChecks';
import { getWordById } from '../data/words';
import { getPigAnimal, useGameStore } from '../stores/gameStore';

type OptionState = 'idle' | 'correct' | 'incorrect';

export const ComprehensionCheckScreen = () => {
  const navigate = useNavigate();
  const { wordId } = useParams<{ wordId: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [optionState, setOptionState] = useState<OptionState>('idle');

  const pig = getPigAnimal();
  const markWordCompleted = useGameStore((state) => state.markWordCompleted);
  const getNextWordForCurrentAnimal = useGameStore(
    (state) => state.getNextWordForCurrentAnimal,
  );

  const check = wordId ? getCheckForWord(wordId) : undefined;
  const targetWord = wordId ? getWordById(wordId) : undefined;

  const options = useMemo(() => {
    if (!check) return [];
    const ids = [check.wordId, ...check.distractors];
    // Simple deterministic shuffle: just ensure correct answer is not always first.
    return ids.sort((a, b) => (a < b ? -1 : 1));
  }, [check]);

  const handleBack = () => {
    if (pig) {
      navigate(`/lesson/${pig.id}`);
    } else {
      navigate('/');
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (!check || !pig || optionState === 'correct') return;
    setSelectedId(optionId);

    if (optionId === check.wordId) {
      setOptionState('correct');
      markWordCompleted(check.wordId);

      const nextId = getNextWordForCurrentAnimal();
      const timeout = setTimeout(() => {
        if (nextId) {
          useGameStore.getState().setCurrentWordId(nextId);
          navigate(`/lesson/${pig.id}`);
        } else {
          navigate(`/celebration/${pig.id}`);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }

    setOptionState('incorrect');
    // Allow the child to try again; reset state after a moment.
    window.setTimeout(() => {
      setOptionState('idle');
      setSelectedId(null);
    }, 800);
  };

  if (!wordId || !check || !targetWord || !pig) {
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
          <div className="check-screen__animal" aria-hidden="true">
            🐷
          </div>
          <p className="check-screen__prompt">
            Which one is <span className="check-screen__word">&apos;{targetWord.text}&apos;</span>?
          </p>
        </div>

        <div className="check-screen__options">
          {options.map((optionId) => {
            const word = getWordById(optionId);
            if (!word) return null;

            let stateClass = '';
            if (selectedId === optionId && optionState === 'correct') {
              stateClass = 'check-option--correct';
            } else if (selectedId === optionId && optionState === 'incorrect') {
              stateClass = 'check-option--incorrect';
            }

            return (
              <button
                key={optionId}
                type="button"
                className={`check-option ${stateClass}`}
                onClick={() => handleOptionClick(optionId)}
              >
                <span className="check-option__emoji" aria-hidden="true">
                  🖼️
                </span>
                <span className="check-option__label">{word.displayText ?? word.text}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="check-screen__hear-again"
          onClick={() => {
            // Placeholder hook for playing audio in a future phase.
          }}
        >
          🔊 Hear Again
        </button>
      </main>
    </div>
  );
};

