import { TRASH_BIN } from "../constants/environment/street";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

export const createTrashBinModel = (seed: number): IStreetModel => {
  const { BODY, RIM, LID, BASE, PALETTES } = TRASH_BIN;
  const palette = PALETTES[Math.abs(seed) % PALETTES.length];
  const batch = createMeshBatch();

  batch.addBox({
    size: BASE.SIZE,
    position: [0, BASE.Y, 0],
    color: palette.base,
  });

  batch.addBox({
    size: BODY.LOWER_SIZE,
    position: [0, BODY.LOWER_Y, 0],
    color: palette.body,
  });

  batch.addBox({
    size: BODY.UPPER_SIZE,
    position: [0, BODY.UPPER_Y, 0],
    color: palette.body,
  });

  batch.addBox({
    size: RIM.SIZE,
    position: [0, RIM.Y, 0],
    color: palette.rim,
  });

  batch.addBox({
    size: LID.SIZE,
    position: [0, LID.Y, LID.Z],
    color: palette.lid,
  });

  return toStreetModel(batch, TRASH_BIN.FOOTPRINT, TRASH_BIN.FOOTPRINT);
};
