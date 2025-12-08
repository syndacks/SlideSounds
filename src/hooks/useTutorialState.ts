import { useCallback, useEffect, useState } from 'react';
import { getHasSeenTutorial, setTutorialSeen } from '../lib/progressStorage';

interface TutorialState {
  isVisible: boolean;
  hasSeenTutorial: boolean;
  dismiss: () => void;
  triggerShow: () => void;
}

/**
 * Handles the first-run tutorial overlay. Shows it once, auto-dismisses,
 * and writes the seen state to progress storage.
 */
export const useTutorialState = (): TutorialState => {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => getHasSeenTutorial());
  const [isVisible, setIsVisible] = useState(false);

  const markSeen = useCallback(() => {
    if (!hasSeenTutorial) {
      setTutorialSeen();
      setHasSeenTutorial(true);
    }
  }, [hasSeenTutorial]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    markSeen();
  }, [markSeen]);

  useEffect(() => {
    if (hasSeenTutorial) {
      return;
    }
    const showTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => window.clearTimeout(showTimer);
  }, [hasSeenTutorial]);

  useEffect(() => {
    if (!isVisible || hasSeenTutorial) {
      return;
    }
    const hideTimer = window.setTimeout(() => {
      dismiss();
    }, 5000);
    return () => window.clearTimeout(hideTimer);
  }, [dismiss, hasSeenTutorial, isVisible]);

  const triggerShow = useCallback(() => {
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, [hasSeenTutorial]);

  return {
    isVisible,
    hasSeenTutorial,
    dismiss,
    triggerShow,
  };
};
