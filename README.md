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

Traffic is slower than you. Sedans, hatchbacks, vans, pickups, and taxis spawn ahead in different lanes. Each car has two headlights, and lamp brightness varies from car to car. Cars that fall behind the camera are removed.

## Stack

- React and TypeScript for the page and HUD
- Three.js for the city, cars, and star sky
- Rapier for the car bodies and collision hits
- Vite for the dev server and build

## Layout

```text
src/assets/components/   HUD and the canvas the game draws into
src/game/                game loop, player, traffic, and physics
src/game/assets/         meshes: cars, buildings, houses, sky, signals
src/game/level/          the looping road and city
src/game/util/           steering math and lane positions
src/game/const.ts        shared speeds, damage, and camera settings
```

`src/game/game.ts` is the composition root. It steps Rapier, moves the street, and renders the frame.
