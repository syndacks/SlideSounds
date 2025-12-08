interface Progress {
  completedWords: string[];
  hasSeenTutorial?: boolean;
}

const STORAGE_KEY = 'slidesounds_progress';
const DEFAULT_PROGRESS: Progress = {
  completedWords: [],
  hasSeenTutorial: false,
};

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadProgress(): Progress {
  if (!isBrowserEnvironment()) {
    return { ...DEFAULT_PROGRESS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROGRESS };
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
        hasSeenTutorial: Boolean(parsed.hasSeenTutorial),
      };
    }
  } catch {
    // If anything goes wrong, start fresh rather than crashing.
  }

  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress: Progress): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  try {
    const payload: Progress = {
      completedWords: progress.completedWords ?? [],
      hasSeenTutorial: Boolean(progress.hasSeenTutorial),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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

export function getHasSeenTutorial(): boolean {
  return Boolean(loadProgress().hasSeenTutorial);
}

export function setTutorialSeen(): void {
  const progress = loadProgress();
  if (progress.hasSeenTutorial) {
    return;
  }
  progress.hasSeenTutorial = true;
  saveProgress(progress);
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
