import { useCallback, useState } from "react";

import { LEVELS } from "../../../game/levels";
import {
  getInitialMenuLevelIndex,
  storeSelectedLevelId,
} from "../../../game/selectedLevel";

import { ExpandLevelSelectHint } from "./ExpandLevelSelectHint";
import { getMenuLevelMeta } from "./menuLevelMeta";
import { LevelSelectScreen } from "./LevelSelectScreen";
import { MenuBackdrop } from "./MenuBackdrop";
import { MenuTopBar } from "./MenuTopBar";
import { PlayLaunchButton } from "./PlayLaunchButton";
import { TrackCarouselPill } from "./TrackCarouselPill";

import "./MainMenu.css";

interface Props {
  onSelectLevel: (levelId: string) => void;
}

const wrapIndex = (index: number, length: number): number => {
  if (length === 0) {
    return 0;
  }

  return ((index % length) + length) % length;
};

export const MainMenu = ({ onSelectLevel }: Props) => {
  const [activeIndex, setActiveIndex] = useState(getInitialMenuLevelIndex);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);

  const level = LEVELS[activeIndex] ?? LEVELS[0];
  const meta = getMenuLevelMeta(level.id);

  const launchCurrent = useCallback(() => {
    storeSelectedLevelId(level.id);
    onSelectLevel(level.id);
  }, [level.id, onSelectLevel]);

  const openLevelSelect = useCallback(() => {
    setIsLevelSelectOpen(true);
  }, []);

  const closeLevelSelect = useCallback(() => {
    setIsLevelSelectOpen(false);
  }, []);

  const selectIndex = useCallback((index: number) => {
    const nextIndex = wrapIndex(index, LEVELS.length);
    const nextLevel = LEVELS[nextIndex];

    setActiveIndex(nextIndex);

    if (nextLevel) {
      storeSelectedLevelId(nextLevel.id);
    }
  }, []);

  const confirmRace = useCallback(() => {
    closeLevelSelect();
    launchCurrent();
  }, [closeLevelSelect, launchCurrent]);

  return (
    <div className="main-menu-container">
      <main className="main-menu-frame">
        <MenuBackdrop level={level} />

        <MenuTopBar
          tierLabel={`APEX // TIER ${activeIndex + 1}`}
          onOpenLevelSelect={openLevelSelect}
        />

        <PlayLaunchButton speedwayLabel={meta.speedwayLabel} onLaunch={launchCurrent} />

        <div className="main-menu-bottom">
          <TrackCarouselPill
            level={level}
            meta={meta}
            levelCount={LEVELS.length}
            activeIndex={activeIndex}
            onOpenLevelSelect={openLevelSelect}
            onPrevious={() => selectIndex(activeIndex - 1)}
            onNext={() => selectIndex(activeIndex + 1)}
            onSelectIndex={selectIndex}
          />

          <ExpandLevelSelectHint onOpen={openLevelSelect} />
        </div>

        <LevelSelectScreen
          isOpen={isLevelSelectOpen}
          selectedIndex={activeIndex}
          onClose={closeLevelSelect}
          onSelectIndex={(index) => {
            selectIndex(index);
            window.setTimeout(closeLevelSelect, 240);
          }}
          onConfirmRace={confirmRace}
        />
      </main>
    </div>
  );
};
