import { PALM_TREE } from "../constants/environment/palm";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

export const createPalmTreeModel = (seed: number): IStreetModel => {
  const batch = createMeshBatch();
  const absSeed = Math.abs(seed);
  const scale = PALM_TREE.SIZE_TIERS[absSeed % PALM_TREE.SIZE_TIERS.length];
  const trunkColor =
    PALM_TREE.TRUNK_COLORS[absSeed % PALM_TREE.TRUNK_COLORS.length];
  const leafColor =
    PALM_TREE.LEAF_COLORS[(absSeed >> 2) % PALM_TREE.LEAF_COLORS.length];

  batch.addBox({
    size: PALM_TREE.TRUNK.SIZE,
    position: [0, PALM_TREE.TRUNK.Y, 0],
    color: trunkColor,
  });

  for (let index = 0; index < PALM_TREE.LEAVES.length; index += 1) {
    const leaf = PALM_TREE.LEAVES[index];

    batch.addBox({
      size: leaf.size,
      position: leaf.position,
      color: leafColor,
    });
  }

  const footprint = PALM_TREE.FOOTPRINT * scale;
  const model = toStreetModel(batch, footprint, footprint);

  model.object.scale.setScalar(scale);

  return model;
};
