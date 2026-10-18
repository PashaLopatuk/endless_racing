import type { ILevelConfig } from "../../../game/levels";

import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { LevelArtPreview } from "./LevelArtPreview";
import type { IMenuLevelMeta } from "./menuLevelMeta";

interface Props {
  level: ILevelConfig;
  meta: IMenuLevelMeta;
  onOpenLevelSelect: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const TrackCarouselPill = ({
  level,
  meta,
  onOpenLevelSelect,
  onPrevious,
  onNext,
}: Props) => (
  <section className="track-carousel">
    <div className="track-carousel__row">
      <button
        type="button"
        className="track-carousel__arrow"
        aria-label="Previous track"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
      >
        <ChevronLeftIcon className="track-carousel__arrow-icon" />
      </button>

      <button
        type="button"
        className="track-carousel__capsule"
        aria-label="Open level selector"
        onClick={onOpenLevelSelect}
      >
        <span className="track-carousel__thumb">
          <LevelArtPreview level={level} className="level-art-preview level-art-preview--thumb" />
          <span className="track-carousel__thumb-gradient" />
          <span className="track-carousel__active-badge">
            <span className="track-carousel__active-dot" />
            ACTIVE
          </span>
        </span>

        <span className="track-carousel__details">
          <span className="track-carousel__title">{meta.displayName}</span>
          <span className="track-carousel__subtitle">{meta.subtitle}</span>
        </span>
      </button>

      <button
        type="button"
        className="track-carousel__arrow"
        aria-label="Next track"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
      >
        <ChevronRightIcon className="track-carousel__arrow-icon" />
      </button>
    </div>
  </section>
);
