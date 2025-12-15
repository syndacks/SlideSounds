import { MatchStatus } from '../lib/phonicsMatching';
import { SpeechRecognizerStatus } from '../hooks/useSpeechRecognizer';
import { WordDefinition } from '../types/phoneme';

interface SpeakPromptCardProps {
  word: WordDefinition;
  status: SpeechRecognizerStatus;
  supportsSpeech: boolean;
  matchStatus: MatchStatus;
  partialTranscript: string;
  finalTranscript: string;
  errorMessage?: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onSkip: () => void;
  isUnlocked: boolean;
}

const statusCopy = (
  status: SpeechRecognizerStatus,
  matchStatus: MatchStatus,
  supportsSpeech: boolean,
  errorMessage?: string | null,
): string => {
  if (!supportsSpeech) {
    return 'Speech preview not supported here.';
  }
  if (matchStatus === 'match') {
    return 'You said it!';
  }
  if (matchStatus === 'close') {
    return 'So close—try one more time.';
  }
  if (status === 'error') {
    return errorMessage ?? 'We could not hear that.';
  }
  if (status === 'listening') {
    return 'Listening...';
  }
  if (status === 'starting' || status === 'processing') {
    return 'Hold on...';
  }
  return 'Tap the mic and say it out loud.';
};

export const SpeakPromptCard = ({
  word,
  status,
  supportsSpeech,
  matchStatus,
  partialTranscript,
  finalTranscript,
  errorMessage,
  onStartListening,
  onStopListening,
  onSkip,
  isUnlocked,
}: SpeakPromptCardProps) => {
  const transcript = finalTranscript || partialTranscript;
  const isListening = status === 'listening' || status === 'starting';
  const micLabel = isUnlocked
    ? 'Ready!'
    : isListening
      ? 'Listening'
      : 'Tap to start';
  const cardStateClass = isUnlocked
    ? 'speak-card--success'
    : matchStatus === 'close'
      ? 'speak-card--almost'
      : isListening
        ? 'speak-card--listening'
        : '';
  const statusText = statusCopy(status, matchStatus, supportsSpeech, errorMessage);
  const displayWord = (word.displayText ?? word.text).toUpperCase();
  const showSkip =
    !supportsSpeech || status === 'error' || (!isUnlocked && matchStatus === 'none');

  return (
    <div className={`speak-card ${cardStateClass}`}>
      <div className="speak-card__word">
        Say&nbsp;
        <span className="speak-card__word-text">{displayWord}</span>
      </div>
      <button
        type="button"
        className={`speak-card__mic ${isListening ? 'speak-card__mic--active' : ''}`}
        onClick={isListening ? onStopListening : onStartListening}
        disabled={!supportsSpeech && !isUnlocked}
        aria-pressed={isListening}
      >
        <span className="speak-card__mic-icon" aria-hidden="true">
          {isUnlocked ? '✅' : '🎤'}
        </span>
        <span className="speak-card__mic-label">{micLabel}</span>
      </button>

      <p className="speak-card__status" role="status">
        {statusText}
      </p>

      {transcript && (
        <div className="speak-card__transcript" aria-live="polite">
          “{transcript}”
        </div>
      )}

      {showSkip && (
        <button type="button" className="speak-card__skip" onClick={onSkip}>
          Skip for now
        </button>
      )}
    </div>
  );
};
