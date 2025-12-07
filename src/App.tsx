import { useState } from 'react';
import { PhonicsWord } from './components/PhonicsWord';
import './App.css';

const WORDS = [
  // Short A
  'cat', 'sat', 'mat', 'bat', 'rat', 'pat', 'fat', 'man', 'pan', 'fan',
  // Short I
  'sit', 'fit', 'hit', 'bit', 'rid', 'lid', 'fin', 'pin', 'win', 'him',
  // Short O
  'hot', 'cot', 'pot', 'not', 'got',
  // Short U
  'sun', 'run', 'fun', 'cup', 'bus'
];

function App() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentWordIndex((prev) => (prev - 1 + WORDS.length) % WORDS.length);
  };

  const handleNext = () => {
    setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
  };

  return (
    <div className="app">
      <h1>SlideSounds</h1>
      <div className="word-practice">
        <button className="nav-arrow" onClick={handlePrevious} aria-label="Previous word">
          ←
        </button>
        <div className="word-container">
          <PhonicsWord word={WORDS[currentWordIndex]} />
        </div>
        <button className="nav-arrow" onClick={handleNext} aria-label="Next word">
          →
        </button>
      </div>
      <p className="instructions">
        Slide your finger across the letters
      </p>
    </div>
  );
}

export default App;
