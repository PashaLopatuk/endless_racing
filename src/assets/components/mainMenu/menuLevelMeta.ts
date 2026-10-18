export interface IMenuLevelMeta {
  displayName: string;
  subtitle: string;
  biomeTag: string;
  biomeAccent: "cyan" | "fuchsia" | "amber" | "orange";
  rating: string;
  distanceLabel: string;
  speedwayLabel: string;
  hazard: string;
  hazardTone: "low" | "med" | "high" | "extreme";
  corners: string;
  surface: string;
}

export const MENU_LEVEL_META: Record<string, IMenuLevelMeta> = {
  "night-city": {
    displayName: "NIGHT CITY",
    subtitle: "Neon District Run",
    biomeTag: "BIOME 01",
    biomeAccent: "fuchsia",
    rating: "★ 4.9",
    distanceLabel: "ENDLESS",
    speedwayLabel: "NEON CUP // SECTOR 02",
    hazard: "HIGH",
    hazardTone: "high",
    corners: "22",
    surface: "WET ASPHALT",
  },
  suburbs: {
    displayName: "SUBURBS",
    subtitle: "Oak Lane Loop",
    biomeTag: "BIOME 02",
    biomeAccent: "amber",
    rating: "★ 4.7",
    distanceLabel: "ENDLESS",
    speedwayLabel: "DAYTONA OPEN // ROUTE 12",
    hazard: "LOW",
    hazardTone: "low",
    corners: "12",
    surface: "DRY ASPHALT",
  },
};

export const getMenuLevelMeta = (levelId: string): IMenuLevelMeta => {
  const meta = MENU_LEVEL_META[levelId];

  if (!meta) {
    return {
      displayName: levelId,
      subtitle: "District Run",
      biomeTag: "BIOME",
      biomeAccent: "cyan",
      rating: "★ —",
      distanceLabel: "ENDLESS",
      speedwayLabel: "APEX // OPEN RUN",
      hazard: "LOW",
      hazardTone: "low",
      corners: "—",
      surface: "ASPHALT",
    };
  }

  return meta;
};
