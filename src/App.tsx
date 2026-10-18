import { useState } from "react";

import { GameCanvas } from "./assets/components/GameCanvas";
import { MainMenu } from "./assets/components/MainMenu";
import { getLevelConfig } from "./game/levels";

const App = () => {
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);

  return (
    <div className="app-shell">
      {activeLevelId ? (
        <GameCanvas
          level={getLevelConfig(activeLevelId)}
          onExit={() => setActiveLevelId(null)}
        />
      ) : (
        <MainMenu onSelectLevel={setActiveLevelId} />
      )}
    </div>
  );
};

export default App;
