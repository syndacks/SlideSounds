import { memo, useMemo } from 'react';
import { WordDefinition } from '../types/phoneme';

interface WordImageRevealProps {
  word: WordDefinition;
  /** Progress ratio from 0 to 1 */
  progress: number;
  /** Whether the word has been completed */
  isComplete: boolean;
}

/**
 * Progressively reveals the word's image as the child scrubs through.
 * Creates anticipation: "What word am I sounding out?"
 * 
 * - 0-20%: Mystery state (question mark / silhouette)
 * - 20-80%: Gradual reveal (blur decreasing, opacity increasing)
 * - 80-100%: Nearly visible
 * - Complete: Full reveal with celebration effect
 */
export const WordImageReveal = memo(({ word, progress, isComplete }: WordImageRevealProps) => {
  const hasImage = !!word.image?.src;
  
  // Calculate reveal states based on progress
  const revealState = useMemo(() => {
    if (isComplete) {
      return {
        blur: 0,
        opacity: 1,
        scale: 1,
        showMystery: false,
        mysteryOpacity: 0,
      };
    }
    
    // Mystery fades out between 0-40% progress
    const mysteryOpacity = Math.max(0, 1 - progress * 2.5);
    
    // Image starts appearing at 15% and is fully visible at 90%
    const revealProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.75));
    
    // Blur goes from 20px to 0px
    const blur = 20 * (1 - revealProgress);
    
    // Opacity goes from 0.2 to 1
    const opacity = 0.2 + 0.8 * revealProgress;
    
    // Slight scale up as it reveals
    const scale = 0.95 + 0.05 * revealProgress;
    
    return {
      blur,
      opacity,
      scale,
      showMystery: progress < 0.4,
      mysteryOpacity,
    };
  }, [progress, isComplete]);

  // Fallback display for words without images
  const FallbackDisplay = () => (
    <div className="word-reveal__fallback">
      <span className="word-reveal__fallback-letter">
        {word.displayText?.charAt(0).toUpperCase() || word.text.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  return (
    <div 
      className={`word-reveal ${isComplete ? 'word-reveal--complete' : ''}`}
      aria-label={isComplete ? `Revealed word: ${word.displayText || word.text}` : 'Mystery word - keep swiping to reveal!'}
    >
      {/* Mystery overlay */}
      {revealState.showMystery && (
        <div 
          className="word-reveal__mystery"
          style={{ opacity: revealState.mysteryOpacity }}
          aria-hidden="true"
        >
          <span className="word-reveal__mystery-icon">❓</span>
          <span className="word-reveal__mystery-text">What word is it?</span>
        </div>
      )}
      
      {/* The actual image/content that reveals */}
      <div 
        className="word-reveal__content"
        style={{
          filter: `blur(${revealState.blur}px)`,
          opacity: revealState.opacity,
          transform: `scale(${revealState.scale})`,
        }}
      >
        {hasImage ? (
          <img
            className="word-reveal__image"
            src={word.image!.src}
            alt={word.image!.alt}
            loading="eager"
            decoding="async"
          />
        ) : (
          <FallbackDisplay />
        )}
      </div>

      {/* Celebration sparkles on complete */}
      {isComplete && (
        <div className="word-reveal__celebration" aria-hidden="true">
          <span className="word-reveal__sparkle word-reveal__sparkle--1">✨</span>
          <span className="word-reveal__sparkle word-reveal__sparkle--2">⭐</span>
          <span className="word-reveal__sparkle word-reveal__sparkle--3">✨</span>
        </div>
      )}
    </div>
  );
});

WordImageReveal.displayName = 'WordImageReveal';
