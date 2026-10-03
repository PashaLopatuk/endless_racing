import { lazy, Suspense } from "react";
import { GameCanvas } from "./assets/components/GameCanvas";
import { useTutorialState } from "./lib/useTutorialState";

const Tutorial = lazy(async () => await import("./assets/components/Tutorial"));

const App = () => {
  const { hasSeenTutorial, setTutorialSeen } = useTutorialState();

  return (
    <div className="app-shell">
      {/*{!hasSeenTutorial && (
        <Suspense fallback={<></>}>
          <Tutorial onClose={setTutorialSeen} />
        </Suspense>
      )}*/}

      <GameCanvas />
    </div>
  );
};

export default App;
