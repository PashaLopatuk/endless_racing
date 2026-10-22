import { BATCH_LAYER } from "../constants/assets";
import {
  OVERHEAD_TRAFFIC_LIGHT,
  TRAFFIC_LIGHT,
} from "../constants/environment/street";
import { ROAD_HALF_WIDTH } from "../constants/world";
import { mixHex } from "../util/color";
import { getLaneCenterX } from "../util/lane";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

const addSignalHead = (
  batch: ReturnType<typeof createMeshBatch>,
  x: number,
  facingZ: number,
  litIndex: number,
) => {
  const { HEAD, BACKPLATE, LAMP, VISOR } = OVERHEAD_TRAFFIC_LIGHT;
  const { LAMP_COLORS, UNLIT_GLOW } = TRAFFIC_LIGHT;

  batch.addBox({
    size: BACKPLATE.SIZE,
    position: [x, HEAD.Y, 0],
    color: BACKPLATE.COLOR,
  });

  const headZ = facingZ * (BACKPLATE.SIZE[2] / 2 + HEAD.SIZE[2] / 2);
  batch.addBox({
    size: HEAD.SIZE,
    position: [x, HEAD.Y, headZ],
    color: HEAD.COLOR,
  });

  const lampZ = headZ + facingZ * (HEAD.SIZE[2] / 2 + LAMP.SIZE[2] / 2 - 0.02);

  LAMP_COLORS.forEach((color, index) => {
    const lampY = LAMP.TOP_Y - index * LAMP.STEP;

    // 3. Сама лампа
    batch.addBox({
      size: LAMP.SIZE,
      position: [x, lampY, lampZ],
      // Змішуємо з чорним кольором щита, щоб вимкнені лампи виглядали темними
      color:
        index === litIndex ? color : mixHex(BACKPLATE.COLOR, color, UNLIT_GLOW),
      layer: BATCH_LAYER.GLOW,
    });

    // 4. Дашок (visor) над лампою
    batch.addBox({
      size: VISOR.SIZE,
      position: [x, lampY + VISOR.Y_OFFSET, lampZ + facingZ * VISOR.Z_OFFSET],
      color: VISOR.COLOR,
    });
  });
};

export const createOverheadTrafficLightModel = (seed: number): IStreetModel => {
  const { POLE, BEAM_SIZE, BEAM_TOP_Y, BEAM_BOTTOM_Y } = OVERHEAD_TRAFFIC_LIGHT;
  const spanHalf = ROAD_HALF_WIDTH + OVERHEAD_TRAFFIC_LIGHT.SPAN_PAST_EDGE;
  const litIndex = Math.abs(seed) % TRAFFIC_LIGHT.LAMP_COLORS.length;
  const batch = createMeshBatch();
  const headLanes = OVERHEAD_TRAFFIC_LIGHT.HEAD_LANES;

  // Опори
  for (const side of [-1, 1] as const) {
    batch.addBox({
      size: POLE.SIZE,
      position: [side * spanHalf, POLE.Y, 0],
      color: POLE.COLOR,
    });
  }

  // Верхня балка
  batch.addBox({
    size: [spanHalf * 2, BEAM_SIZE[1], BEAM_SIZE[2]],
    position: [0, BEAM_TOP_Y, 0],
    color: POLE.COLOR,
  });

  // Нижня балка
  batch.addBox({
    size: [spanHalf * 2, BEAM_SIZE[1], BEAM_SIZE[2]],
    position: [0, BEAM_BOTTOM_Y, 0],
    color: POLE.COLOR,
  });

  // Додаємо світлофори
  for (const lane of headLanes) {
    const x = getLaneCenterX(lane);
    addSignalHead(batch, x, 1, litIndex);
    addSignalHead(batch, x, -1, litIndex);
  }

  return toStreetModel(
    batch,
    spanHalf * 2,
    BEAM_SIZE[2] + Math.abs(OVERHEAD_TRAFFIC_LIGHT.LAMP.Z) * 3,
  );
};
