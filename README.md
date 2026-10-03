# Endless Racing

A night-time endless racer. You drive a four-lane city street, steer around slower traffic, and keep going until your health runs out.

The city scrolls toward the camera. Buildings, houses, and traffic lights loop back to the front of the road so the street never ends.

## Run

```bash
npm install
npm run dev
```

The dev server listens on port 3000. Open the local URL Vite prints.

Other scripts:

```bash
npm run build
npm run preview
npm run lint
```

## How to play

Drag in the **lower half** of the screen.

- Pull **right** to move the car right. Pull **left** to move it left.
- Pull **up** to go faster. Pull **down** to slow down.
- The nose turns first. The rear follows, like a front-wheel-drive car.
- The view widens as speed increases and tightens again when you slow down.

**Pause** freezes the race. **Resume** continues from the same spot. At zero health the run ends, and **Retry** starts a new one.

You begin with full health.

- A scrape along the side costs a little health and shoves the cars apart.
- Hitting a car from the front, or being hit from behind, costs much more health and cuts your speed.

Traffic is slower than you. Sedans, hatchbacks, vans, pickups, and taxis spawn ahead in different lanes. Each car casts two soft headlight beams, and lamp brightness varies from car to car. All traffic cars are built when the game starts and wait in a parking lot behind the camera; they are moved onto the road when needed and parked again once they fall behind.

The street mixes five building types (slab towers, setback towers, warehouses, glass offices, apartment blocks) and six house types (brownstones, gable houses, townhouses, bungalows, modern houses, corner shops). Colours vary per building, and every window pane is randomly dark or lit at its own brightness.

## Stack

- React and TypeScript for the page and HUD
- Three.js for the city, cars, and star sky
- Rapier for the car bodies and collision hits
- Vite for the dev server and build

## Layout

```text
src/assets/components/   HUD and the canvas the game draws into
src/constants/           HUD text
src/game/                lifecycle, session, player, traffic, collisions, physics
src/game/constants/      every tunable number and colour, grouped by domain
src/game/assets/         meshes: cars, headlight beams, buildings, houses, road, sky, signals
src/game/level/          the looping street
src/game/util/           math, seeded random, colour, steering, lanes
```

- `game.ts` boots Rapier and runs a `GameSession` on the animation loop. It logs and reports any failure.
- `session.ts` owns one race: the scene, the actors, and the fixed-step simulation.
- `collision.ts` classifies hits and pushes cars apart. The hit cooldown runs on simulation time.
- `assets/meshBatch.ts` merges each building into at most two meshes (lit and glowing) with shared vertex-colour materials.
- `assets/sharedAssets.ts` caches geometries and materials reused across cars and buildings.
