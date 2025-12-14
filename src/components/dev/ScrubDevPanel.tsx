import { useMemo, useState } from 'react';
import { WordAudioMetadata, getWordAudioMetadata } from '../../data/wordAudioMetadata';

interface ScrubDevPanelProps {
  wordId: string;
  letters: string[];
  anchorRatios: number[];
  durationSeconds: number | null;
  progressRatio: number;
  isAudioReady: boolean;
  audioError: string | null;
  onAnchorChange?: (index: number, ratio: number) => void;
  onResetAnchors?: () => void;
}

const clampRatio = (ratio: number): number => {
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(1, Math.max(0, ratio));
};

const formatMs = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }
  return `${Math.round(value)}ms`;
};

const formatPercent = (ratio: number): string => `${Math.round(ratio * 100)}%`;

const useMetadata = (wordId: string): WordAudioMetadata | undefined =>
  getWordAudioMetadata(wordId);

export const ScrubDevPanel = ({
  wordId,
  letters,
  anchorRatios,
  durationSeconds,
  progressRatio,
  isAudioReady,
  audioError,
  onAnchorChange,
  onResetAnchors,
}: ScrubDevPanelProps) => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const metadata = useMetadata(wordId);
  const durationMs = durationSeconds ? durationSeconds * 1000 : metadata?.durationMs ?? null;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const exportPayload = useMemo(() => {
    const anchors = letters.map((_letter, index) => {
      const ratio = anchorRatios[index] ?? 0;
      const timeMs = durationMs ? Math.round(ratio * durationMs) : Math.round(ratio * 1000);
      return {
        letterIndex: index,
        label: letters[index],
        timeMs,
      };
    });
    const payload = {
      wordId,
      durationMs: durationMs ? Math.round(durationMs) : undefined,
      anchors,
    };
    return JSON.stringify(payload, null, 2);
  }, [anchorRatios, durationMs, letters, wordId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportPayload);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy anchors', error);
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 2500);
    }
  };

  return (
    <div className="scrub-dev-panel" aria-live="polite">
      <div className="scrub-dev-panel__header">
        <strong>Scrub Debug</strong>
        <span>{wordId}</span>
      </div>
      <div className="scrub-dev-panel__meta">
        <span>Audio: {isAudioReady ? 'ready' : 'loading…'}</span>
        <span>Duration: {formatMs(durationMs)}</span>
        <span>Progress: {formatPercent(progressRatio)}</span>
      </div>
      {audioError && (
        <div className="scrub-dev-panel__error">Audio error: {audioError}</div>
      )}

      <div className="scrub-dev-panel__anchors">
        {letters.map((letter, index) => {
          const ratio = anchorRatios[index] ?? 0;
          const timeMs = durationMs ? ratio * durationMs : null;
          const timeInputValue = timeMs ?? '';

          const handleRatioChange = (nextRatio: number) => {
            onAnchorChange?.(index, clampRatio(nextRatio));
          };

          const handleTimeChange = (ms: number) => {
            if (!durationMs) return;
            const ratioFromTime = clampRatio(ms / durationMs);
            onAnchorChange?.(index, ratioFromTime);
          };

          return (
            <div className="scrub-dev-panel__anchor" key={`${letter}-${index}`}>
              <div className="scrub-dev-panel__anchor-row">
                <span className="scrub-dev-panel__anchor-letter">{letter}</span>
                <span className="scrub-dev-panel__anchor-ratio">{formatPercent(ratio)}</span>
                <span className="scrub-dev-panel__anchor-time">{formatMs(timeMs)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(ratio * 100)}
                onChange={(event) => handleRatioChange(Number(event.target.value) / 100)}
                className="scrub-dev-panel__slider"
              />
              <input
                type="number"
                className="scrub-dev-panel__input"
                value={timeInputValue === '' ? '' : Math.round(timeInputValue)}
                onChange={(event) => {
                  if (event.target.value === '') return;
                  handleTimeChange(Number(event.target.value));
                }}
                disabled={!durationMs}
                placeholder="ms"
                min={0}
              />
            </div>
          );
        })}
      </div>

      <div className="scrub-dev-panel__actions">
        <button type="button" onClick={handleCopy}>
          {copyStatus === 'copied'
            ? 'Copied!'
            : copyStatus === 'error'
              ? 'Copy failed'
              : 'Copy metadata JSON'}
        </button>
        <button type="button" onClick={onResetAnchors} disabled={!onResetAnchors}>
          Reset overrides
        </button>
      </div>

      {metadata && (
        <div className="scrub-dev-panel__metadata">
          <strong>Current metadata entry</strong>
          <pre>{JSON.stringify(metadata.anchors, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
