import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { IMountainModelOptions } from "../levels/types";

export interface ILowPolyMountainItem {
  readonly object: THREE.Group;
  dispose(): void;
}

/**
 * Sunny California green mountain color matching Los Angeles Hollywood Hills.
 * Under key & fill lighting, facets display vibrant grassy green on sunlit sides
 * and deep forest/sage tones in the shadows.
 */
export const DEFAULT_MOUNTAIN_COLOR = 0x6e9652;

/**
 * Builds the low-poly Hollywood Hills mountain range:
 * - Slopes down towards the center of the horizon (behind the Downtown skyline).
 * - Rises majestically on the sides with faceted peaks and ridges framing the skyline.
 * - Flat-shaded geometric facets with sunny California green palette.
 * - Bold 3D extruded white "HOLLYWOOD" sign on the right hillside facing the camera.
 * - Scattered small low-poly deciduous trees and palm trees.
 */
export const createHollywoodMountainModel = (
  options: IMountainModelOptions = {},
): ILowPolyMountainItem => {
  const {
    color = DEFAULT_MOUNTAIN_COLOR,
    side = "right",
    showHollywoodSign = side === "right",
    signColor = 0xffffff,
    showTrees = true,
  } = options;

  const group = new THREE.Group();
  group.name = `hollywood-mountain-${side}`;

  const disposables: Array<{ dispose(): void }> = [];

  // ==========================================
  // 1. Mountain Terrain Mesh
  // ==========================================
  // Base raw vertices defined where:
  // - Positive X (from X = 20 to 68) slopes down to ground level Y = 0.
  // - Negative X (from X = -58 to 7) contains the high peaks P1 (22), P2 (26), P3 (32).
  // - The sign slope is at X = 16..36, Y = 8..17.
  const rawVertices: [number, number, number][] = [
    // 0: L_BASE
    [-58, 0, -5],
    // 1: L_MID
    [-52, 10, -2],
    // 2: P1 (Left Summit)
    [-38, 22, 4],
    // 3: S12 (Saddle between P1 and P2)
    [-26, 17, 2],
    // 4: P2 (Mid-Left Summit)
    [-16, 26, 5],
    // 5: S23 (Saddle between P2 and P3)
    [-4, 18, 4],
    // 6: P3 (Tall Sharp Central Summit)
    [7, 32, 8],
    // 7: CREST34 (Ridge drop between P3 and P4)
    [20, 22, 6],
    // 8: P4 (Right Summit above Hollywood sign)
    [36, 21, 3],
    // 9: R_SHOULDER (Right shoulder ridge)
    [52, 16, -3],
    // 10: R_MID (Right mid slope)
    [64, 8, -10],
    // 11: R_BASE (Far right base)
    [68, 0, -16],
    // 12: BACK_L (Rear base left)
    [-55, 0, 22],
    // 13: BACK_ML (Rear base mid-left)
    [-22, 0, 24],
    // 14: BACK_C (Rear base center under P3)
    [8, 0, 26],
    // 15: BACK_MR (Rear base mid-right)
    [36, 0, 24],
    // 16: BACK_R (Rear base right)
    [60, 0, 20],
    // 17: F_L_SLOPE (Left front slope mid)
    [-46, 7, -16],
    // 18: SHELF12 (Shoulder between P1 & P2 with trees)
    [-28, 12, -10],
    // 19: SPUR_L (Lower front left spur)
    [-35, 4, -24],
    // 20: RIDGE2_MID (Prominent facet point below P2)
    [-14, 13, -11],
    // 21: RIDGE2_LOW (Lower point of central ridge)
    [-10, 5, -22],
    // 22: SADDLE23_LOW (Crevice between P2 & P3)
    [-2, 10, -8],
    // 23: CREVICE3_MID (Crevice in front of P3)
    [5, 13, -4],
    // 24: HW_TOP_L (Top-left of Hollywood sign slope)
    [16, 17, -3],
    // 25: HW_TOP_R (Top-right of Hollywood sign slope)
    [36, 16, -5],
    // 26: HW_BOT_L (Bottom-left of Hollywood sign slope)
    [12, 9, -17],
    // 27: HW_BOT_R (Bottom-right of Hollywood sign slope)
    [34, 8, -19],
    // 28: HW_VALLEY_L (Notch to left of Hollywood sign with palms)
    [6, 8, -15],
    // 29: TERRACE_L (Front terrace left corner)
    [-2, 6, -21],
    // 30: TERRACE_M (Front terrace mid)
    [18, 5, -23],
    // 31: TERRACE_R (Front terrace right corner)
    [38, 4, -25],
    // 32: R_SLOPE_MID (Slope right of Hollywood sign)
    [48, 8, -18],
    // 33: R_SLOPE_LOW (Lower slope far right)
    [58, 4, -22],
    // 34: G_L1 (Ground left 1)
    [-48, 0, -24],
    // 35: G_L2 (Ground left 2)
    [-32, 0, -26],
    // 36: G_C (Ground under central ridge)
    [-10, 0, -25],
    // 37: G_TL (Ground below terrace cliff left)
    [-2, 0, -23],
    // 38: G_TM (Ground below terrace cliff mid)
    [18, 0, -25],
    // 39: G_TR (Ground below terrace cliff right)
    [38, 0, -27],
    // 40: G_R1 (Ground right 1)
    [52, 0, -26],
    // 41: G_R2 (Ground right 2)
    [62, 0, -22],
  ];

  // For the RIGHT mountain: negate X so the slope down to 0 faces the center (negative X),
  // and the high peaks face the outer right (positive X).
  // For the LEFT mountain: keep original X so the slope down to 0 faces the center (positive X),
  // and the high peaks face the outer left (negative X).
  const isRight = side === "right";
  const vertices = isRight
    ? rawVertices.map(([x, y, z]): [number, number, number] => [-x, y, z])
    : rawVertices.map(([x, y, z]): [number, number, number] => [x, y, z]);

  const rawIndices: [number, number, number][] = [
    // Left mountain
    [0, 17, 1], [0, 34, 17], [1, 17, 2], [17, 18, 2],
    [17, 19, 18], [17, 34, 19], [34, 35, 19],
    // Saddle 12 & Peak 2
    [2, 18, 3], [3, 18, 4], [2, 3, 4],
    [18, 20, 4], [18, 19, 20], [19, 21, 20],
    [19, 35, 21], [35, 36, 21],
    // Peak 2 right slope
    [20, 22, 4], [4, 22, 5], [20, 21, 22], [21, 36, 22],
    // Peak 3
    [4, 5, 6], [5, 22, 6], [22, 23, 6],
    [22, 29, 23], [22, 36, 29], [36, 37, 29],
    [6, 23, 7], [23, 28, 7], [23, 29, 28],
    // Terrace cliff
    [29, 37, 38], [29, 38, 30], [30, 38, 39], [30, 39, 31],
    // Terrace shelf
    [29, 28, 30], [28, 26, 30], [26, 27, 30], [30, 27, 31],
    // Hollywood sign slope
    [28, 24, 26], [24, 25, 27], [24, 27, 26],
    // Above Hollywood sign
    [7, 28, 24], [7, 24, 8], [24, 25, 8],
    // Right slope
    [27, 32, 31], [31, 32, 39], [39, 32, 40],
    [8, 25, 9], [25, 32, 9], [9, 32, 10],
    [32, 33, 10], [32, 40, 33], [40, 41, 33],
    [10, 33, 11], [33, 41, 11],
    // Back faces
    [0, 1, 12], [1, 2, 12], [2, 13, 12], [2, 3, 13],
    [3, 4, 13], [4, 14, 13], [4, 5, 14], [5, 6, 14],
    [6, 15, 14], [6, 7, 15], [7, 8, 15], [8, 16, 15],
    [8, 9, 16], [9, 10, 16], [10, 11, 16],
    // Base bottom seal
    [0, 12, 13], [0, 13, 34], [34, 13, 35], [35, 13, 14],
    [35, 14, 36], [36, 14, 37], [37, 14, 38], [38, 14, 15],
    [38, 15, 39], [39, 15, 16], [39, 16, 40], [40, 16, 41],
    [41, 16, 11],
  ];

  // Align face normal windings to point outward from mountain center
  const interior = new THREE.Vector3(0, 4, 0);
  const mountainPositions: number[] = [];

  for (const triangle of rawIndices) {
    const a = triangle[0];
    let b = triangle[1];
    let c = triangle[2];
    const vA = new THREE.Vector3(...vertices[a]);
    const vB = new THREE.Vector3(...vertices[b]);
    const vC = new THREE.Vector3(...vertices[c]);

    const center = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
    const outward = new THREE.Vector3().subVectors(center, interior);

    const cb = new THREE.Vector3().subVectors(vC, vB);
    const ab = new THREE.Vector3().subVectors(vA, vB);
    const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();

    if (normal.dot(outward) < 0) {
      const temp = b;
      b = c;
      c = temp;
    }

    mountainPositions.push(...vertices[a], ...vertices[b], ...vertices[c]);
  }

  const mountainGeom = new THREE.BufferGeometry();
  mountainGeom.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(mountainPositions), 3),
  );
  mountainGeom.computeVertexNormals();

  const mountainMaterial = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const mountainMesh = new THREE.Mesh(mountainGeom, mountainMaterial);
  group.add(mountainMesh);
  disposables.push(mountainGeom, mountainMaterial);

  // ==========================================
  // 2. 3D HOLLYWOOD Sign (Block Extruded Letters)
  // ==========================================
  if (showHollywoodSign && isRight) {
    const signGroup = new THREE.Group();
    signGroup.name = "hollywood-3d-sign";

    const createLetterBoxes = (
      char: string,
      xOffset: number,
      width: number = 1.3,
      height: number = 2.4,
      depth: number = 0.55,
      thickness: number = 0.32,
    ): THREE.BoxGeometry[] => {
      const boxes: THREE.BoxGeometry[] = [];
      const h = height;
      const w = width;
      const t = thickness;
      const d = depth;

      const addBox = (
        bx: number,
        by: number,
        bz: number,
        bw: number,
        bh: number,
        bd: number,
      ) => {
        const geom = new THREE.BoxGeometry(bw, bh, bd);
        geom.translate(xOffset + bx, by, bz);
        boxes.push(geom);
      };

      switch (char) {
        case "H":
          addBox(-w / 2 + t / 2, h / 2, 0, t, h, d);
          addBox(w / 2 - t / 2, h / 2, 0, t, h, d);
          addBox(0, h / 2, 0, w - t * 2, t, d);
          break;
        case "O":
          addBox(-w / 2 + t / 2, h / 2, 0, t, h, d);
          addBox(w / 2 - t / 2, h / 2, 0, t, h, d);
          addBox(0, h - t / 2, 0, w, t, d);
          addBox(0, t / 2, 0, w, t, d);
          break;
        case "L":
          addBox(-w / 2 + t / 2, h / 2, 0, t, h, d);
          addBox(0, t / 2, 0, w, t, d);
          break;
        case "Y":
          addBox(0, h * 0.25, 0, t, h * 0.5, d);
          addBox(-w * 0.25, h * 0.75, 0, t, h * 0.5, d);
          addBox(w * 0.25, h * 0.75, 0, t, h * 0.5, d);
          addBox(0, h * 0.5, 0, w * 0.5, t, d);
          break;
        case "W":
          addBox(-w / 2 + t / 2, h / 2, 0, t, h, d);
          addBox(w / 2 - t / 2, h / 2, 0, t, h, d);
          addBox(0, h * 0.35, 0, t, h * 0.7, d);
          addBox(-w / 4, t / 2, 0, w / 2, t, d);
          addBox(w / 4, t / 2, 0, w / 2, t, d);
          break;
        case "D":
          addBox(-w / 2 + t / 2, h / 2, 0, t, h, d);
          addBox(w / 2 - t / 2, h / 2, 0, t, h - t * 1.5, d);
          addBox(0, h - t / 2, 0, w - t, t, d);
          addBox(0, t / 2, 0, w - t, t, d);
          break;
      }
      return boxes;
    };

    const word = "HOLLYWOOD";
    const letterGeoms: THREE.BoxGeometry[] = [];
    let curX = 0;
    const letterHeight = 2.4;

    for (let i = 0; i < word.length; i += 1) {
      const char = word[i];
      const w = char === "W" ? 1.8 : 1.3;
      letterGeoms.push(
        ...createLetterBoxes(char, curX, w, letterHeight, 0.55, 0.32),
      );
      curX += 1.85;
    }

    const mergedLetters = mergeGeometries(letterGeoms);
    letterGeoms.forEach((geom) => geom.dispose());

    if (mergedLetters) {
      const signMaterial = new THREE.MeshLambertMaterial({
        color: signColor,
        flatShading: true,
        emissive: 0x222222,
      });

      const signMesh = new THREE.Mesh(mergedLetters, signMaterial);

      // Center the sign across its hillside mount
      mergedLetters.center();

      // Position the sign precisely on the hillside slope facing the camera/road
      signMesh.position.set(-24.5, 12.8, -12.0);
      signMesh.rotation.set(-0.32, 0.16, 0.06);

      signGroup.add(signMesh);
      disposables.push(mergedLetters, signMaterial);
    }

    group.add(signGroup);
  }

  // ==========================================
  // 3. Low-Poly Trees and Palm Trees
  // ==========================================
  if (showTrees) {
    const trunks: THREE.CylinderGeometry[] = [];
    const canopies: THREE.IcosahedronGeometry[] = [];
    const palmLeaves: THREE.ConeGeometry[] = [];

    const addTree = (
      x: number,
      y: number,
      z: number,
      treeScale: number = 1.0,
    ) => {
      const finalX = isRight ? -x : x;
      const trunk = new THREE.CylinderGeometry(
        0.12 * treeScale,
        0.16 * treeScale,
        1.2 * treeScale,
        5,
      );
      trunk.translate(finalX, y + 0.6 * treeScale, z);
      trunks.push(trunk);

      const canopy = new THREE.IcosahedronGeometry(0.85 * treeScale, 0);
      canopy.translate(finalX, y + 1.4 * treeScale, z);
      canopies.push(canopy);
    };

    const addPalm = (
      x: number,
      y: number,
      z: number,
      palmScale: number = 1.0,
      tiltZ: number = 0.12,
      tiltX: number = 0.08,
    ) => {
      const finalX = isRight ? -x : x;
      const finalTiltZ = isRight ? -tiltZ : tiltZ;

      const trunk = new THREE.CylinderGeometry(
        0.1 * palmScale,
        0.15 * palmScale,
        1.8 * palmScale,
        5,
      );
      trunk.rotateZ(finalTiltZ);
      trunk.rotateX(tiltX);
      trunk.translate(finalX, y + 0.9 * palmScale, z);
      trunks.push(trunk);

      const leafCount = 5;
      for (let i = 0; i < leafCount; i += 1) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leaf = new THREE.ConeGeometry(0.35 * palmScale, 1.1 * palmScale, 3);
        leaf.rotateX(Math.PI * 0.38);
        leaf.rotateY(angle);
        leaf.translate(
          finalX + Math.sin(angle) * 0.45 * palmScale,
          y + 1.8 * palmScale,
          z + Math.cos(angle) * 0.45 * palmScale,
        );
        palmLeaves.push(leaf);
      }
    };

    // Add trees & palms matching the reference render placements
    // Shelf between Peak 1 & Peak 2
    addTree(-27, 13.0, -9.0, 1.0);
    addTree(-24, 13.8, -7.5, 0.85);

    // Lower-left slopes
    addTree(-44, 8.0, -16.0, 0.95);
    addPalm(-39, 10.5, -12.0, 1.05, -0.15, 0.05);

    // Near the Hollywood sign
    addPalm(13, 9.8, -13.5, 1.1, 0.14, 0.08);
    addPalm(11, 9.5, -14.5, 0.95, -0.08, 0.12);

    // Front terrace shelf
    addTree(25, 5.5, -22.0, 0.9);
    addTree(19, 5.5, -23.0, 0.85);

    // Right slopes
    addPalm(48, 8.5, -17.0, 1.0, 0.16, -0.06);
    addTree(56, 5.0, -20.0, 0.8);

    // Terrace ledges below sign
    addTree(27, 7.0, -18.5, 0.75);
    addTree(35, 3.5, -24.5, 0.7);

    const mergedTrunks = mergeGeometries(trunks);
    trunks.forEach((geom) => geom.dispose());

    const mergedCanopies = mergeGeometries(canopies);
    canopies.forEach((geom) => geom.dispose());

    const mergedLeaves = mergeGeometries(palmLeaves);
    palmLeaves.forEach((geom) => geom.dispose());

    if (mergedTrunks) {
      const trunkMaterial = new THREE.MeshLambertMaterial({
        color: 0x5a3e2a,
        flatShading: true,
      });
      group.add(new THREE.Mesh(mergedTrunks, trunkMaterial));
      disposables.push(mergedTrunks, trunkMaterial);
    }

    if (mergedCanopies) {
      const canopyMaterial = new THREE.MeshLambertMaterial({
        color: 0x3a5e2a,
        flatShading: true,
      });
      group.add(new THREE.Mesh(mergedCanopies, canopyMaterial));
      disposables.push(mergedCanopies, canopyMaterial);
    }

    if (mergedLeaves) {
      const leafMaterial = new THREE.MeshLambertMaterial({
        color: 0x2e6b26,
        flatShading: true,
      });
      group.add(new THREE.Mesh(mergedLeaves, leafMaterial));
      disposables.push(mergedLeaves, leafMaterial);
    }
  }

  return {
    object: group,
    dispose: () => {
      disposables.forEach((item) => item.dispose());
      disposables.length = 0;
      group.clear();
    },
  };
};

/**
 * Creates the LEFT mountain model: sweeping Hollywood Hills mountain range
 * sloping down to 0 at the center (behind Downtown) and rising on the left horizon.
 */
export const createLeftMountainModel = (
  options: IMountainModelOptions = {},
): ILowPolyMountainItem => {
  return createHollywoodMountainModel({
    side: "left",
    showHollywoodSign: false,
    ...options,
  });
};
