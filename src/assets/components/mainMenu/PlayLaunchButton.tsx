interface Props {
  speedwayLabel: string;
  onLaunch: () => void;
}

export const PlayLaunchButton = ({ speedwayLabel, onLaunch }: Props) => (
  <section className="menu-play-hero">
    <button
      type="button"
      className="menu-play-button"
      aria-label="Start race"
      onClick={onLaunch}
    >
      <span className="menu-play-triangle-wrap">
        <svg
          className="menu-play-triangle"
          fill="none"
          viewBox="0 0 160 170"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="menuTriangleFrosted"
              x1="20"
              x2="150"
              y1="20"
              y2="150"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#e2e8f0" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="menuTriangleStroke"
              x1="10"
              x2="140"
              y1="10"
              y2="160"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#menuTriangleFrosted)"
            points="30,12 144,85 30,158"
            stroke="url(#menuTriangleStroke)"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
      </span>
    </button>

    <div className="menu-play-copy">
      <p className="menu-play-copy__title">TAP TO LAUNCH</p>
      <p className="menu-play-copy__subtitle">{speedwayLabel}</p>
    </div>
  </section>
);
