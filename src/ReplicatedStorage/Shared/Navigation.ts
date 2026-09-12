/** World north is -Z. Diagonals use the middle half of each quadrant. */
export function bearing(x: number, z: number): string {
  const length = math.sqrt(x * x + z * z);
  if (length < 0.01) return "here";
  const vertical = math.abs(z) / length > 0.38 ? (z < 0 ? "N" : "S") : "";
  const horizontal = math.abs(x) / length > 0.38 ? (x < 0 ? "W" : "E") : "";
  return vertical + horizontal;
}
export function destination(label: string, x: number, z: number): string {
  const distance = math.floor(math.sqrt(x * x + z * z));
  return `${label}: ${distance} studs ${bearing(x, z)}`;
}
