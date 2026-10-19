import { SoundProvider } from "react-sounds";
import { MainSynthwaveTheme } from "./assets/audio";
import { Game } from "./Game";

const App = () => {
  return (
    <SoundProvider preload={[MainSynthwaveTheme]}>
      <Game />
    </SoundProvider>
  );
};

export default App;
