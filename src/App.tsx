import { GameCanvas } from "./assets/components/GameCanvas";
const App = () => {
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
