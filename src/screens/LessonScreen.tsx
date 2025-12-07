import { useCallback, useEffect } from 'react';
import { ScrubWord } from '../components/ScrubWord';
import { getWordById } from '../data/words';
import { useGameStore, useWordNavigation } from '../stores/gameStore';

export const LessonScreen = () => {
  const currentWordId = useGameStore((state) => state.currentWordId);
  const markComplete = useGameStore((state) => state.markComplete);
  const word = getWordById(currentWordId);

  const { currentIndex, totalWords, nextWord, previousWord, hasNext, hasPrevious } =
    useWordNavigation();

  const handleComplete = useCallback(() => {
    markComplete();
  }, [markComplete]);

  // Keyboard navigation for desktop testing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && hasNext) {
        nextWord();
      } else if (event.key === 'ArrowLeft' && hasPrevious) {
        previousWord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrevious, nextWord, previousWord]);

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
            className="lesson-screen__nav-btn"
            onClick={previousWord}
            disabled={!hasPrevious}
            aria-label="Previous word"
          >
            ← Prev
          </button>
          <span className="lesson-screen__progress">
            Word {currentIndex} of {totalWords}
          </span>
          <button
            className="lesson-screen__nav-btn"
            onClick={nextWord}
            disabled={!hasNext}
            aria-label="Next word"
          >
            Next →
          </button>
        </div>
        <h1 className="lesson-screen__word">{word.displayText ?? word.text}</h1>
        {word.phase && (
          <span className="lesson-screen__phase">Phase {word.phase}</span>
        )}
      </header>

      <ScrubWord word={word} onComplete={handleComplete} />

      <footer className="lesson-screen__footer">
        <div className="lesson-screen__keyboard-hints">
          <span>Use arrow keys ← → to navigate words</span>
        </div>
      </footer>
    </div>
  );
};
