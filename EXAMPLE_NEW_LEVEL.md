# 🎨 Quick Start: Creating a New Level

## Example: "Sunset Boulevard" Level

This example shows how to create a new level with custom building geometries using the refactored system.

---

## Step 1: Create Folder Structure

```bash
mkdir -p src/game/levels/sunsetBoulevard/{buildings,terrain,environment}
```

---

## Step 2: Define Buildings with Custom Geometry

**File:** `src/game/levels/sunsetBoulevard/buildings/index.ts`

```typescript
import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import { WINDOW_KIND } from "../../../constants/environment/buildingsWindows";
import type { IBuildingSet } from "../../buildings/types";

export const SUNSET_BOULEVARD_BUILDINGS: IBuildingSet = {
  colorRandomize: {
    HUE: 0.08,
    SATURATION: 0.15,
    LIGHTNESS: 0.1,
  },
  neonColors: [
    0xff6b9d,  // Pink
    0xffb347,  // Orange
    0xc77dff,  // Purple
  ],
  metalColors: [0x2a2a2a, 0x3a3a3a],
  buildings: [
    {
      id: "sunset-luxury-apartment",
      style: BUILDING_STYLE.APARTMENT,
      weight: 4,
      wallColors: [
        0xe8d8c8, 0xd8c8b8, 0xc8b8a8,  // Cream/beige tones
      ],
      trimColors: [
        0xa89888, 0x988878, 0x887868,  // Warm browns
      ],
      // 🎨 CUSTOM: Taller, wider luxury apartments
      geometry: {
        width: [10, 15],      // Wider than default (8-12)
        depth: [14, 20],      // Deeper than default (12-18)
        height: [18, 32],     // Taller than default (14-26)
        floorHeight: 3.2,     // Taller ceilings (vs 2.9)
        windowKind: WINDOW_KIND.BAY,  // Force bay windows
      },
    },
    {
      id: "sunset-boutique-hotel",
      style: BUILDING_STYLE.SETBACK,
      weight: 3,
      wallColors: [
        0xf8e8d8, 0xe8d8c8, 0xd8c8b8,  // Warm pastels
      ],
      trimColors: [
        0xc8b8a8, 0xb8a898, 0xa89888,
      ],
      // 🎨 CUSTOM: Shorter, wider setback towers
      geometry: {
        width: [10, 20],      // Wider base
        depth: [10, 18],
        height: [20, 40],     // Shorter than default (varies by tier)
      },
    },
    {
      id: "sunset-restaurant",
      style: BUILDING_STYLE.WAREHOUSE,  // Repurposed as restaurant
      weight: 2,
      wallColors: [
        0x8a5a4a, 0x7a4a3a, 0x6a3a2a,  // Warm brick
      ],
      trimColors: [
        0x5a4a3a, 0x4a3a2a, 0x3a2a1a,
      ],
      // 🎨 CUSTOM: Low-rise, wide restaurants
      geometry: {
        width: [16, 24],      // Very wide
        depth: [12, 18],
        height: [6, 10],      // Low-rise (vs default 6-14)
      },
    },
    {
      id: "sunset-office-standard",
      style: BUILDING_STYLE.OFFICE,
      weight: 1,
      wallColors: [
        0x4a5a68, 0x3a4a58, 0x2a3a48,  // Cool glass
      ],
      trimColors: [
        0x6a7a88, 0x5a6a78, 0x4a5a68,
      ],
      // No geometry = uses default OFFICE_TOWER constants
      // Demonstrates mixing custom + default in one level!
    },
  ],
};
```

---

## Step 3: Define Palette

**File:** `src/game/levels/sunsetBoulevard/palette.ts`

```typescript
import type { ILevelPalette } from "../types";

export const SUNSET_BOULEVARD_PALETTE: ILevelPalette = {
  outputGamma: 1.18,  // Warm, saturated look
  skyColor: 0xff8c42,
  fogNear: 25,
  fogFar: 150,
  horizon: [0.95, 0.45, 0.25],  // Orange horizon
  zenith: [0.35, 0.25, 0.55],   // Purple zenith
  hemisphere: {
    sky: 0xff9966,
    ground: 0x3a2a1a,
    intensity: 0.9,
  },
  keyLight: {
    color: 0xffe0cc,  // Warm sunset light
    intensity: 1.55,
    position: [-40, 28, -20],  // Low angle (sunset)
  },
  fillLight: {
    color: 0x6a4a8a,  // Purple fill
    intensity: 0.55,
    position: [24, 18, 28],
  },
};
```

---

## Step 4: Define Terrain

**File:** `src/game/levels/sunsetBoulevard/terrain/index.ts`

```typescript
import type { ITerrainConfig } from "../../types";

export const SUNSET_BOULEVARD_TERRAIN: ITerrainConfig = {
  groundColor: 0x2a1a0a,      // Dark earth
  asphaltColor: 0x3a2a1a,     // Warm asphalt
  sidewalkColor: 0xe8d8c8,    // Light beige pavers
  edgeColor: 0xf8e8d8,        // Cream markings
  dashColor: 0xfff8f0,        // Off-white dashes
};
```

---

## Step 5: Define Environment

**File:** `src/game/levels/sunsetBoulevard/environment/index.ts`

```typescript
import type { IEnvironmentConfig } from "../../types";

export const SUNSET_BOULEVARD_ENVIRONMENT: IEnvironmentConfig = {
  street: {
    ROAD_SEGMENT_LENGTH: 48,
    ROAD_SEGMENT_COUNT: 8,
    ROAD_SEGMENTS_BEHIND: 1,
    SIDEWALK_WIDTH: 3.2,  // Wider sidewalks
    DESPAWN_Z: -72,
  },
  rows: {
    BUILDINGS: {
      COUNT_PER_SIDE: 10,
      SPACING: 32,
      START_Z: -52,
      GAP: 2.0,
      SEED_LEFT: 10000,   // Unique seeds
      SEED_RIGHT: 11000,
    },
    // ... (copy structure from nightCity or industrial)
    HOUSES: {
      COUNT_PER_SIDE: 10,
      SPACING: 20,
      START_Z: -28,
      ROW_DEPTH: 12,
      CURB_GAP: 0.8,
      SEED_LEFT: 12000,
      SEED_RIGHT: 13000,
    },
    // ... (other rows)
  },
  houses: {
    wallColors: [
      0xe8c8a8, 0xd8b898, 0xc8a888,  // Warm stucco
    ],
    trimColors: [0xa88868, 0x987858],
    roofColors: [0x6a4a3a, 0x5a3a2a],
    doorColors: [0x3a2a1a, 0x2a1a0a],
    awningColors: [0xff6666, 0x66ff66],
    neonColors: [0xff6b9d, 0xffb347],
  },
};
```

---

## Step 6: Assemble Level

**File:** `src/game/levels/sunsetBoulevard/index.ts`

```typescript
import { TRAFFIC, INITIAL_TRAFFIC } from "../../constants/traffic";
import { VEHICLE_KIND } from "../../constants/vehicles";
import type { ILevelConfig } from "../types";
import { SUNSET_BOULEVARD_BUILDINGS } from "./buildings";
import { SUNSET_BOULEVARD_ENVIRONMENT } from "./environment";
import { SUNSET_BOULEVARD_PALETTE } from "./palette";
import { SUNSET_BOULEVARD_TERRAIN } from "./terrain";

export const SUNSET_BOULEVARD_LEVEL: ILevelConfig = {
  id: "sunset-boulevard",
  name: "Sunset Boulevard",
  palette: SUNSET_BOULEVARD_PALETTE,
  terrain: SUNSET_BOULEVARD_TERRAIN,
  environment: SUNSET_BOULEVARD_ENVIRONMENT,
  buildings: SUNSET_BOULEVARD_BUILDINGS,
  cars: {
    kinds: [VEHICLE_KIND.TAXI, VEHICLE_KIND.SEDAN],
    initialTraffic: INITIAL_TRAFFIC,
    minSpeed: TRAFFIC.MIN_SPEED,
    maxSpeed: TRAFFIC.MAX_SPEED,
  },
};
```

---

## Step 7: Register Level

**File:** `src/game/levels/index.ts`

```typescript
import { INDUSTRIAL_LEVEL } from "./industrial";
import { NIGHT_CITY_LEVEL } from "./nightCity";
import { SUNSET_BOULEVARD_LEVEL } from "./sunsetBoulevard";  // ⭐ Add import
import type { ILevelConfig } from "./types";

export const LEVELS: readonly ILevelConfig[] = [
  NIGHT_CITY_LEVEL,
  INDUSTRIAL_LEVEL,
  SUNSET_BOULEVARD_LEVEL,  // ⭐ Add to array
];
```

---

## Step 8: Test

```bash
npm run build
npm run dev
```

Navigate to the main menu and select "Sunset Boulevard"!

---

## 🎨 What We Customized

| Building | Custom Geometry | Effect |
|----------|----------------|--------|
| **Luxury Apartment** | Wider (10-15), Taller (18-32), Higher ceilings (3.2m), Bay windows | Grand, upscale residential |
| **Boutique Hotel** | Wider base (10-20), Shorter (20-40) | Elegant, human-scale setbacks |
| **Restaurant** | Very wide (16-24), Low-rise (6-10) | Sprawling dining establishments |
| **Office** | *(no geometry)* | Uses default OFFICE_TOWER specs |

---

## 🌟 Key Takeaways

1. **Mix Custom + Default**: Not all buildings need geometry overrides
2. **Per-Building Control**: Each building in a set can have unique dimensions
3. **Repurpose Styles**: Warehouse style → Restaurant with custom geometry
4. **Falls Back Gracefully**: Omitted geometry = uses shared constants
5. **Type-Safe**: TypeScript catches invalid configurations

---

## 📖 Full Documentation

See `src/game/levels/README.md` for complete reference.
