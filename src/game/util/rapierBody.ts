import type * as RAPIER from "@dimforge/rapier3d-compat";

/** Copies a rigid-body translation; uses a fresh buffer on every call (required by Rapier WASM). */
export const readBodyTranslation = (
  body: RAPIER.RigidBody,
): { x: number; y: number; z: number } => {
  const out = { x: 0, y: 0, z: 0 };

  body.translation(out);

  return { x: out.x, y: out.y, z: out.z };
};
