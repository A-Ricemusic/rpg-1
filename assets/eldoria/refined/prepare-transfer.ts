// Offline Blender mesh payload compaction. Run with bun; never synced to Roblox.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
type Vec = [number, number, number];
interface Raw {
  name: string;
  material: string;
  color: Vec;
  v: Vec[];
  n: Vec[];
  f: Vec[];
}
const root = "assets/eldoria/refined/meshes";
for (const asset of await readdir(root)) {
  const dir = join(root, asset);
  const names = JSON.parse(await readFile(join(dir, "index.json"), "utf8")) as string[];
  const groups = new Map<string, Raw>();
  for (const file of names) {
    const r = JSON.parse(await readFile(join(dir, file), "utf8")) as Raw;
    let g = groups.get(r.material);
    if (!g) {
      g = { ...r, v: [], n: [], f: [] };
      groups.set(r.material, g);
    }
    const base = g.v.length;
    g.v.push(...r.v);
    g.n.push(...r.n);
    g.f.push(...r.f.map((f) => f.map((i) => i + base) as Vec));
  }
  const output = join("assets/eldoria/refined/transfer", asset);
  await mkdir(output, { recursive: true });
  const files: string[] = [];
  for (const [material, g] of groups) {
    const low: Vec = [Infinity, Infinity, Infinity],
      high: Vec = [-Infinity, -Infinity, -Infinity];
    for (const v of g.v)
      for (let a = 0; a < 3; a++) {
        low[a] = Math.min(low[a], v[a]);
        high[a] = Math.max(high[a], v[a]);
      }
    const center = low.map((n, a) => (n + high[a]) / 2) as Vec;
    for (let start = 0; start < g.f.length; start += 700) {
      const vertices: Vec[] = [],
        normals: Vec[] = [],
        faces: Vec[] = [];
      const seen = new Map<string, number>();
      for (const face of g.f.slice(start, start + 700)) {
        const f: number[] = [];
        for (const old of face) {
          const v = g.v[old].map((n, a) => Number((n - center[a]).toFixed(5))) as Vec;
          const n = g.n[old];
          const key = [...v, ...n].join(",");
          let i = seen.get(key);
          if (i === undefined) {
            i = vertices.length;
            vertices.push(v);
            normals.push(n);
            seen.set(key, i);
          }
          f.push(i);
        }
        faces.push(f as Vec);
      }
      const name = material + "-" + Math.floor(start / 700) + ".json";
      files.push(name);
      await writeFile(
        join(output, name),
        JSON.stringify({
          asset,
          material,
          color: g.color,
          center,
          v: vertices,
          n: normals,
          f: faces,
          first: start === 0,
          last: start + 700 >= g.f.length,
        }),
      );
    }
  }
  await writeFile(join(output, "index.json"), JSON.stringify(files));
  console.log(asset + ": " + files.length + " compact transfer chunks");
}
