import { TREE } from "../constants/environment/tree";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

export const createTreeModel = (seed: number): IStreetModel => {
  const batch = createMeshBatch();
  const absSeed = Math.abs(seed);
  const scale = TREE.SIZE_TIERS[absSeed % TREE.SIZE_TIERS.length];
  const trunkColor = TREE.TRUNK_COLORS[absSeed % TREE.TRUNK_COLORS.length];
  const leafColor = TREE.LEAF_COLORS[(absSeed >> 2) % TREE.LEAF_COLORS.length];
  const useRoundCanopy = absSeed % 3 === 1;

  batch.addBox({
    size: TREE.TRUNK.SIZE,
    position: [0, TREE.TRUNK.Y, 0],
    color: trunkColor,
  });

  if (useRoundCanopy) {
    batch.addBox({
      size: TREE.FOLIAGE_ROUND.SIZE,
      position: [0, TREE.FOLIAGE_ROUND.Y, 0],
      color: leafColor,
    });
  } else {
    const layerCount =
      2 + (absSeed % (TREE.FOLIAGE_LAYERS.length - 1));

    for (let index = 0; index < layerCount; index += 1) {
      const layer = TREE.FOLIAGE_LAYERS[index];

      batch.addBox({
        size: layer.size,
        position: [0, layer.y, 0],
        color: leafColor,
      });
    }
  }

  const footprint = TREE.FOOTPRINT * scale;
  const model = toStreetModel(batch, footprint, footprint);

  model.object.scale.setScalar(scale);

  return model;
};
