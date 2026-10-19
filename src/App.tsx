import { useState } from "react";

import { GameCanvas } from "./assets/components/GameCanvas";
import { MainMenu } from "./assets/components/mainMenu/MainMenu";
import { getLevelConfig } from "./game/levels";
import { Sound, SoundProvider } from "react-sounds";
import { MainSynthwaveTheme } from "./assets/audio";
import { readSelectedLevelId } from "./game/selectedLevel";
import { readSoundEnabled } from "./game/soundEnabled";

const App = () => {
  const [activeLevelId, setActiveLevelId] = useState(readSelectedLevelId());

  return (
    <SoundProvider
      preload={[MainSynthwaveTheme]}
      initialEnabled={readSoundEnabled()}
    >
      <Sound
        name={MainSynthwaveTheme}
        trigger="mount"
        options={{ loop: true }}
      />
      <div className="app-shell">
        {!!activeLevelId && (
          <GameCanvas
            level={getLevelConfig(activeLevelId)}
            onExit={() => setActiveLevelId(null)}
          />
        )}
        {!activeLevelId && <MainMenu onSelectLevel={setActiveLevelId} />}
      </div>
    </SoundProvider>
  );
};

export default App;
