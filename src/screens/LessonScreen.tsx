import { ScrubWord } from '../components/ScrubWord';
import { getWordById } from '../data/words';
import { useGameStore } from '../stores/gameStore';

export const LessonScreen = () => {
  const currentWordId = useGameStore((state) => state.currentWordId);
  const word = getWordById(currentWordId);

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
        <p className="lesson-screen__label">Phase A Prototype</p>
        <h1 className="lesson-screen__word">{word.displayText ?? word.text}</h1>
      </header>
      <ScrubWord word={word} />
    </div>
  );
};
