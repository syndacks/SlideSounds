interface Progress {
  completedWords: string[];
}

const STORAGE_KEY = 'slidesounds_progress';

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadProgress(): Progress {
  if (!isBrowserEnvironment()) {
    return { completedWords: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { completedWords: [] };
    }
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray(parsed.completedWords)
    ) {
      return {
        completedWords: parsed.completedWords.filter(
          (id: unknown): id is string => typeof id === 'string',
        ),
      };
    }
  } catch {
    // If anything goes wrong, start fresh rather than crashing.
  }

  return { completedWords: [] };
}

export function saveProgress(progress: Progress): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore write errors in constrained environments.
  }
}

export function markWordComplete(wordId: string): void {
  const progress = loadProgress();
  if (!progress.completedWords.includes(wordId)) {
    progress.completedWords.push(wordId);
    saveProgress(progress);
  }
}

export function resetProgress(): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors on reset.
  }
}

