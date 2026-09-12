/** Melee arcs use horizontal aim, so a cursor on the ground does not aim the swing into it. */
export function inMeleeArc(aimX: number, aimZ: number, targetX: number, targetZ: number): boolean {
  const targetLength = math.sqrt(targetX * targetX + targetZ * targetZ);
  if (targetLength < 3) return true;
  const aimLength = math.sqrt(aimX * aimX + aimZ * aimZ);
  if (aimLength < 0.001) return false;
  return (aimX * targetX + aimZ * targetZ) / (aimLength * targetLength) > 0.15;
}
