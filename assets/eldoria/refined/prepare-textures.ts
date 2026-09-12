// Decode the Blender PNG bakes using built-in APIs; no package installation.
import { inflateSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const root = "assets/eldoria/refined";
await mkdir(root + "/texture-transfer", { recursive: true });
const files: string[] = [];
for (const material of ["Sandstone", "Bark", "Basalt", "Mesa"])
  for (const kind of ["Color", "Normal", "Roughness"]) {
    const png = await readFile(root + "/textures/" + material + "_" + kind + ".png");
    let offset = 8,
      width = 0,
      height = 0,
      channels = 0;
    const compressed: Buffer[] = [];
    while (offset < png.length) {
      const length = png.readUInt32BE(offset),
        type = png.toString("ascii", offset + 4, offset + 8),
        data = png.subarray(offset + 8, offset + 8 + length);
      if (type === "IHDR") {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        if (data[8] !== 8) throw Error("Expected 8-bit PNG");
        channels = data[9] === 2 ? 3 : data[9] === 6 ? 4 : 0;
        if (!channels) throw Error("Expected RGB/RGBA PNG");
      }
      if (type === "IDAT") compressed.push(data);
      offset += length + 12;
    }
    const raw = inflateSync(Buffer.concat(compressed));
    const stride = width * channels;
    const decoded = new Uint8Array(height * stride);
    let input = 0;
    const paeth = (a: number, b: number, c: number) => {
      const p = a + b - c,
        pa = Math.abs(p - a),
        pb = Math.abs(p - b),
        pc = Math.abs(p - c);
      return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    };
    for (let y = 0; y < height; y++) {
      const filter = raw[input++];
      for (let x = 0; x < stride; x++) {
        const at = y * stride + x,
          a = x >= channels ? decoded[at - channels] : 0,
          b = y ? decoded[at - stride] : 0,
          c = y && x >= channels ? decoded[at - stride - channels] : 0;
        const predictor =
          filter === 0
            ? 0
            : filter === 1
              ? a
              : filter === 2
                ? b
                : filter === 3
                  ? Math.floor((a + b) / 2)
                  : paeth(a, b, c);
        decoded[at] = (raw[input++] + predictor) & 255;
      }
    }
    const size = kind === "Roughness" ? 1 : 256;
    const pixels = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const sx = Math.floor((x * width) / size),
          sy = Math.floor((y * height) / size),
          at = (sy * width + sx) * channels,
          dest = (y * size + x) * 4;
        for (let c = 0; c < 3; c++) pixels[dest + c] = decoded[at + c];
        pixels[dest + 3] = 255;
      }
    for (let row = 0; row < size; row += 32) {
      const rows = Math.min(32, size - row);
      const name = material + "_" + kind + "_" + row + ".json";
      files.push(name);
      await writeFile(
        root + "/texture-transfer/" + name,
        JSON.stringify({
          material,
          kind,
          size,
          row,
          rows,
          first: row === 0,
          last: row + rows === size,
          data: pixels.subarray(row * size * 4, (row + rows) * size * 4).toString("base64"),
        }),
      );
    }
  }
await writeFile(root + "/texture-transfer/index.json", JSON.stringify(files));
console.log("Prepared " + files.length + " direct texture chunks");
