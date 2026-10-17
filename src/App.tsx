import { useState } from "react";

import { GameCanvas } from "./assets/components/GameCanvas";
import { DEFAULT_LEVEL, getLevelConfig } from "./game/levels";

const App = () => {
  const [levelId, setLevelId] = useState(DEFAULT_LEVEL.id);

  return (
    <div className="app-shell">
      <GameCanvas level={getLevelConfig(levelId)} onLevelChange={setLevelId} />
    </div>
  );
};

export default App;
