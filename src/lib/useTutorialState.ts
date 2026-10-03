import { useState } from "react";

const TUTORIAL_COMPLETED_KEY = "tutorial-completed";

export function useTutorialState() {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    const value = window.localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    return !!value;
  });

  const setTutorialSeen = () => {
    window.localStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
    setHasSeenTutorial(true);
  };

  return {
    hasSeenTutorial,
    setTutorialSeen,
  };
}
