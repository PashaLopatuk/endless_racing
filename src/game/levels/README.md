# 🏙️ Level Configuration System

## Overview

This system provides a **modular, extensible architecture** for defining distinct visual and gameplay environments (levels/districts) in Endless Racing. Each level is a self-contained configuration bundle that controls:

- 🎨 **Visual Theme**: Lighting, fog, sky gradients, color grading
- 🏗️ **Buildings**: Architectural styles, dimensions, colors, procedural parameters
- 🛣️ **Terrain**: Road, sidewalk, and ground materials
- 🌆 **Environment**: Street layout, prop placement (lights, signs, trash bins)
- 🚗 **Traffic**: Vehicle types and behavior

---

## Architecture

### Level Structure

Each level lives in its own folder under `src/game/levels/[levelId]/`:

```
src/game/levels/
├── types.ts                    # Shared interfaces
├── index.ts                    # Level registry
├── buildings/
│   └── types.ts                # Building-specific types
├── cars/
│   └── palette.ts              # Independent NPC car colors
├── nightCity/                  # Example: Night City level
│   ├── index.ts                # Level definition
│   ├── palette.ts              # Lighting & atmosphere
│   ├── terrain/
│   │   └── index.ts            # Ground/road colors
│   ├── environment/
│   │   └── index.ts            # Street layout & props
│   └── buildings/
│       └── index.ts            # Building set
└── industrial/                 # Example: Industrial District level
    ├── index.ts
    ├── palette.ts
    ├── terrain/
    │   └── index.ts
    ├── environment/
    │   └── index.ts
    └── buildings/
        └── index.ts
```

### Type Hierarchy

```typescript
interface ILevelConfig {
  id: string;                   // Unique identifier
  name: string;                 // Display name
  palette: ILevelPalette;       // Lighting & fog
  terrain: ITerrainConfig;      // Ground materials
  environment: IEnvironmentConfig; // Street layout
  buildings: IBuildingSet;      // Building definitions
  cars: ICarLevelConfig;        // Traffic config
}
```

---

## Creating a New Level

### Step 1: Create Folder Structure

```bash
mkdir -p src/game/levels/myLevel/{buildings,terrain,environment}
```

### Step 2: Define Palette (`palette.ts`)

Controls lighting, fog, and color grading:

```typescript
import type { ILevelPalette } from "../types";

export const MY_LEVEL_PALETTE: ILevelPalette = {
  outputGamma: 1.12,              // Color grading (0.8-1.3)
  skyColor: 0x1a2030,             // Solid sky color
  fogNear: 22,                    // Fog start distance
  fogFar: 140,                    // Fog end distance
  horizon: [0.06, 0.08, 0.14],    // Horizon color (RGB 0-1)
  zenith: [0.08, 0.12, 0.22],     // Zenith color (RGB 0-1)
  hemisphere: {
    sky: 0x3a4a60,                // Ambient sky light color
    ground: 0x1a1a1c,             // Ambient ground light color
    intensity: 0.78,              // Hemisphere light intensity
  },
  keyLight: {
    color: 0xd0dce8,              // Main directional light color
    intensity: 1.35,              // Key light intensity
    position: [-24, 42, -16],     // Light direction [x, y, z]
  },
  fillLight: {
    color: 0x4a3a28,              // Secondary fill light color
    intensity: 0.42,              // Fill light intensity
    position: [18, 14, 32],       // Fill light direction
  },
};
```

### Step 3: Define Terrain (`terrain/index.ts`)

Controls road and ground material colors:

```typescript
import type { ITerrainConfig } from "../../types";

export const MY_LEVEL_TERRAIN: ITerrainConfig = {
  groundColor: 0x1a1d24,       // Off-road ground
  asphaltColor: 0x2a3038,      // Road surface
  sidewalkColor: 0x3a4048,     // Sidewalk material
  edgeColor: 0xe4d478,         // Lane edge markings
  dashColor: 0xf4f0e8,         // Dashed lane dividers
};
```

### Step 4: Define Environment (`environment/index.ts`)

Controls street layout and prop placement:

```typescript
import type { IEnvironmentConfig } from "../../types";

export const MY_LEVEL_ENVIRONMENT: IEnvironmentConfig = {
  street: {
    ROAD_SEGMENT_LENGTH: 48,     // Length of each road tile
    ROAD_SEGMENT_COUNT: 8,       // Total tiles in loop
    ROAD_SEGMENTS_BEHIND: 1,     // Tiles behind player
    SIDEWALK_WIDTH: 2.4,         // Sidewalk width
    DESPAWN_Z: -72,              // Cleanup distance
  },
  rows: {
    BUILDINGS: {
      COUNT_PER_SIDE: 12,        // Buildings per side
      SPACING: 28,               // Distance between buildings
      START_Z: -48,              // Initial Z position
      GAP: 1.5,                  // Gap from houses
      SEED_LEFT: 1000,           // Random seed (left side)
      SEED_RIGHT: 2000,          // Random seed (right side)
    },
    HOUSES: { /* ... similar structure ... */ },
    TRAFFIC_LIGHTS: { /* ... */ },
    STREET_LIGHTS: { /* ... */ },
    CROSSWALKS: { /* ... */ },
    ROAD_SIGNS: { /* ... */ },
    TRASH_BINS: { /* ... */ },
  },
  houses: {
    wallColors: [0x4e2a22, /* ... */],
    trimColors: [0x6a5e4e, /* ... */],
    roofColors: [0x2a2224, /* ... */],
    doorColors: [0x1a120e, /* ... */],
    awningColors: [0x6a1c1c, /* ... */],
    neonColors: [0xff4fa0, /* ... */],
  },
};
```

### Step 5: Define Buildings (`buildings/index.ts`)

**NEW: Per-Level Geometry Customization**

Each building definition can now override default dimensions:

```typescript
import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import { WINDOW_KIND } from "../../../constants/environment/buildingsWindows";
import type { IBuildingSet } from "../../buildings/types";

export const MY_LEVEL_BUILDINGS: IBuildingSet = {
  colorRandomize: {
    HUE: 0.06,           // Hue variation (0-1)
    SATURATION: 0.12,    // Saturation variation
    LIGHTNESS: 0.08,     // Lightness variation
  },
  neonColors: [0xff4fa0, 0x4fe0ff, 0xffb347],
  metalColors: [0x2a2e33, 0x3a3f46],
  buildings: [
    {
      id: "my-warehouse",
      style: BUILDING_STYLE.WAREHOUSE,
      weight: 4,                    // Spawn probability weight
      wallColors: [0x6a5040, /* ... */],
      trimColors: [0x5a544c, /* ... */],
      
      // ✨ NEW: Optional geometry overrides
      geometry: {
        width: [15, 30],            // [min, max] width range
        depth: [12, 25],            // [min, max] depth range
        height: [8, 18],            // [min, max] height range
        // Optional:
        floorHeight: 4.0,           // Custom floor height
        windowKind: WINDOW_KIND.GRID, // Force window style
        customParams: {             // Style-specific extras
          tankChance: 0.7,
        },
      },
    },
    {
      id: "my-office",
      style: BUILDING_STYLE.OFFICE,
      weight: 3,
      wallColors: [0x2a3440, /* ... */],
      trimColors: [0x8a8078, /* ... */],
      // No geometry = uses default dimensions from constants
    },
  ],
};
```

**Building Styles:**
- `BUILDING_STYLE.SLAB` - Residential slab towers
- `BUILDING_STYLE.SETBACK` - Tiered setback towers
- `BUILDING_STYLE.WAREHOUSE` - Industrial warehouses
- `BUILDING_STYLE.OFFICE` - Glass office towers
- `BUILDING_STYLE.APARTMENT` - Mid-rise apartment blocks

### Step 6: Assemble Level (`index.ts`)

```typescript
import { TRAFFIC, INITIAL_TRAFFIC } from "../../constants/traffic";
import { VEHICLE_KIND } from "../../constants/vehicles";
import type { ILevelConfig } from "../types";
import { MY_LEVEL_BUILDINGS } from "./buildings";
import { MY_LEVEL_ENVIRONMENT } from "./environment";
import { MY_LEVEL_PALETTE } from "./palette";
import { MY_LEVEL_TERRAIN } from "./terrain";

export const MY_LEVEL: ILevelConfig = {
  id: "my-level",
  name: "My Amazing Level",
  palette: MY_LEVEL_PALETTE,
  terrain: MY_LEVEL_TERRAIN,
  environment: MY_LEVEL_ENVIRONMENT,
  buildings: MY_LEVEL_BUILDINGS,
  cars: {
    kinds: [VEHICLE_KIND.TAXI, VEHICLE_KIND.VAN],
    initialTraffic: INITIAL_TRAFFIC,
    minSpeed: TRAFFIC.MIN_SPEED,
    maxSpeed: TRAFFIC.MAX_SPEED,
  },
};
```

### Step 7: Register Level

In `src/game/levels/index.ts`:

```typescript
import { MY_LEVEL } from "./myLevel";
import { NIGHT_CITY_LEVEL } from "./nightCity";
// ... other imports

export const LEVELS: readonly ILevelConfig[] = [
  NIGHT_CITY_LEVEL,
  MY_LEVEL,  // Add here
  // ...
];
```

---

## Key Improvements (Post-Refactor)

### ✅ Before (Rigid System)
- ❌ Building dimensions locked in shared constants
- ❌ Can only change colors via level config
- ❌ Cannot adjust proportions per-level
- ❌ Adding new building types requires core code changes

### ✨ After (Flexible System)
- ✅ **Per-level geometry overrides** via `IBuildingGeometry`
- ✅ Custom width/depth/height ranges
- ✅ Configurable floor heights
- ✅ Window style selection
- ✅ Falls back to defaults when not specified
- ✅ Ready for custom building styles via extensible architecture

---

## Best Practices

### 🎨 Visual Design
- **Contrast**: Ensure fog/horizon colors contrast with road/buildings
- **Gamma**: Use `outputGamma` (0.9-1.2) to adjust overall brightness/contrast
- **Lighting**: Balance key/fill lights for depth; avoid flat lighting
- **Colors**: Choose cohesive palettes; test in-game under motion

### 🏗️ Building Configuration
- **Variety**: Mix 3-5 building styles with varied weights
- **Scale**: Use geometry overrides to match level theme (e.g., wider warehouses for industrial zones)
- **Colors**: Provide 6-12 wall colors and 5-8 trim colors for variety
- **Consistency**: Keep color temperature consistent within a level

### 🛣️ Environment Tuning
- **Spacing**: Adjust `BUILDINGS.SPACING` and `HOUSES.SPACING` for density
- **Seeds**: Use unique random seeds per level to avoid identical layouts
- **Props**: Balance street furniture density (lights, signs, bins) for realism without clutter
- **Performance**: More props = more draw calls; test on target hardware

### 🚗 Traffic Config
- **Vehicle Mix**: Select 2-3 vehicle kinds that fit the theme
- **Speeds**: Keep `minSpeed`/`maxSpeed` consistent unless designing a specific challenge

---

## Troubleshooting

### Buildings Look Wrong
- Check `geometry` ranges don't conflict with procedural constraints
- Verify `wallColors` and `trimColors` arrays aren't empty
- Test with default geometry first, then add overrides

### Fog Too Dense
- Increase `fogFar` value
- Adjust `fogNear` to push fog further away
- Check `horizon`/`zenith` colors aren't too dark

### Environment Props Not Spawning
- Verify `SEED_LEFT` and `SEED_RIGHT` are unique and non-zero
- Check `COUNT_PER_SIDE` values are reasonable (6-15)
- Ensure `START_Z` and `SPACING` don't cause gaps

### Level Not Appearing in Menu
- Confirm level is added to `LEVELS` array in `index.ts`
- Check for TypeScript errors in level config
- Verify `id` is unique across all levels

---

## Future Extensions

### Potential Enhancements
- **Custom Building Styles**: Add new procedural builders beyond the 5 core types
- **Weather Systems**: Rain, fog density variation
- **Time of Day**: Dawn/dusk/night variants per level
- **Dynamic Props**: Animated billboards, moving signs
- **Biome Mixing**: Transition zones between levels

### Adding a Custom Building Style

1. Define new `BUILDING_STYLE` enum value
2. Implement builder function in `src/game/assets/buildings.ts`
3. Register in `BUILDERS` map
4. Use in level's `buildings/index.ts`

---

## Examples

### Night City (Urban, Neon-Lit)
- **Theme**: Dense urban, cool moonlight, warm fill, wet asphalt
- **Buildings**: Mixed towers, apartments, warehouses
- **Palette**: Cool blues, warm accents, high contrast

### Industrial District (Gritty, Daytime)
- **Theme**: Sparse industrial zone, harsh sunlight, warm tones
- **Buildings**: Massive warehouses, squat offices, utilitarian design
- **Palette**: High gamma, warm daylight, earthy colors
- **Custom Geometry**: Wider warehouses, shorter offices

---

## Reference

### Color Formats
- All colors use **hexadecimal RGB** (e.g., `0xff4fa0`)
- RGB arrays use **0-1 normalized values** (e.g., `[0.5, 0.8, 1.0]`)

### Units
- **Distances**: World units (1 unit ≈ 1 meter)
- **Angles**: Radians
- **Intensities**: Multipliers (typically 0.5-2.0)

### Coordinate System
- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Down (-) to Up (+)
- **Z-axis**: Behind (-) to Ahead (+)

---

**Created**: 2026-10-18  
**System Version**: Post-Refactor (Flexible Geometry)  
**Maintainer**: Endless Racing Team
