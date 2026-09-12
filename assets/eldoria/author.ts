// Offline art manifest only. Never synced into Roblox runtime.
import { ALL_ENEMIES } from "../../src/ReplicatedStorage/Shared/EnemyConfig";
type V = [number, number, number];
type Node = {
  name: string;
  kind?: string;
  size?: V;
  pos?: V;
  rot?: V;
  color?: V;
  material?: string;
  shape?: string;
  collide?: boolean;
  alpha?: number;
  light?: number;
  text?: string;
  attrs?: Record<string, string | number | boolean>;
  children?: Node[];
  clone?: string;
  scale?: number;
};
const rgb = (r: number, g: number, b: number): V => [r, g, b];
const gold = rgb(202, 164, 83),
  stone = rgb(139, 150, 139),
  wood = rgb(91, 61, 42),
  cyan = rgb(110, 230, 236);
const part = (
  name: string,
  size: V,
  pos: V,
  color: V,
  material = "SmoothPlastic",
  extra: Partial<Node> = {},
): Node => ({ name, size, pos, color, material, ...extra });
const model = (name: string, children: Node[], extra: Partial<Node> = {}): Node => ({
  name,
  kind: "Model",
  children,
  ...extra,
});
const folder = (name: string, children: Node[]): Node => ({ name, kind: "Folder", children });
const weapon = (name: string, pieces: Node[]): Node =>
  model(name, pieces, {
    kind: "Tool",
    attrs: {
      AssetId: name,
      GripConvention: "+Y blade/shaft; -Z forward; handle center grip",
      AuthoredBy: "WorldArt",
    },
  });
const weapons: Node[] = [
  weapon("Sword", [
    part("Handle", [0.32, 1.15, 0.32], [0, 0, 0], wood),
    part("Pommel", [0.5, 0.3, 0.5], [0, -0.65, 0], gold),
    part("Guard", [1.7, 0.22, 0.45], [0, 0.65, 0], gold),
    part("Blade", [0.55, 3.1, 0.16], [0, 2.3, 0], rgb(192, 218, 225), "Metal"),
    part("Fuller", [0.1, 2.8, 0.18], [0, 2.3, 0], cyan, "Neon"),
    part("Tip", [0.55, 0.65, 0.16], [0, 4.15, 0], rgb(192, 218, 225), "Metal", { shape: "Wedge" }),
  ]),
  weapon("Trident", [
    part("Handle", [0.28, 5.7, 0.28], [0, 1.4, 0], wood),
    part("Collar", [0.5, 0.5, 0.5], [0, 4, 0], gold),
    part("Crossbar", [1.9, 0.24, 0.3], [0, 4.35, 0], gold),
    ...[-0.8, 0, 0.8].map((x, i) =>
      part(
        "Tine" + i,
        [0.22, i === 1 ? 1.9 : 1.4, 0.22],
        [x, i === 1 ? 5.25 : 5, 0],
        cyan,
        "Metal",
      ),
    ),
  ]),
  weapon("Bow", [
    part("Handle", [0.35, 1, 0.4], [0, 0, 0], wood),
    ...[-1, 1].flatMap((s) => [
      part("Limb" + s, [0.25, 1.55, 0.35], [0.3, s * 1.12, 0], gold, "Wood", {
        rot: [0, 0, -s * 25],
      }),
      part("Tip" + s, [0.2, 0.9, 0.28], [0.35, s * 2.12, 0], gold, "Wood", { rot: [0, 0, s * 38] }),
    ]),
    part("Bowstring", [0.035, 4.8, 0.035], [0, 0, 0], rgb(238, 224, 189), "Fabric", {
      collide: false,
    }),
  ]),
  weapon("Arrow", [
    part("Handle", [0.1, 2.8, 0.1], [0, 0, 0], wood),
    part("Arrowhead", [0.38, 0.55, 0.15], [0, 1.6, 0], rgb(195, 218, 222), "Metal", {
      shape: "Wedge",
    }),
    part("Fletching", [0.5, 0.6, 0.08], [0, -1.1, 0], rgb(237, 229, 202), "Fabric"),
  ]),
];
const items: Node[] = [
  model("Wood", [
    part("Log", [0.8, 2, 0.8], [0, 1, 0], wood, "Wood", { shape: "Cylinder" }),
    part("Endgrain", [0.82, 0.1, 0.82], [0, 2, 0], gold, "Wood", { shape: "Cylinder" }),
  ]),
  model("Ore", [
    part("Rock", [1.6, 1.1, 1.3], [0, 0.55, 0], rgb(84, 93, 107), "Rock", { shape: "Ball" }),
    part("Vein", [0.4, 1, 0.4], [0.25, 0.9, 0], gold, "Metal", { rot: [0, 0, 25] }),
  ]),
  model(
    "Crystal",
    [-1, 0, 1].map((x, i) =>
      part("Shard" + i, [0.4, 1.3 + 0.4 * (i % 2), 0.4], [x * 0.35, 0.7, 0], cyan, "Glass", {
        rot: [0, 0, x * 18],
      }),
    ),
  ),
  model(
    "Herb",
    [-1, 0, 1].map((x, i) =>
      part("Leaf" + i, [0.3, 1, 0.6], [x * 0.25, 0.5, 0], rgb(99, 178, 93), "Grass", {
        shape: "Ball",
        rot: [0, 0, x * 32],
      }),
    ),
  ),
  model("Coin", [
    part("Coin", [0.9, 0.12, 0.9], [0, 0.45, 0], gold, "Metal", {
      shape: "Cylinder",
      rot: [90, 0, 0],
    }),
  ]),
  model("HealingPotion", [
    part("Bottle", [0.75, 1, 0.75], [0, 0.5, 0], rgb(237, 80, 103), "Glass", { shape: "Ball" }),
    part("Neck", [0.3, 0.5, 0.3], [0, 1.1, 0], rgb(213, 237, 239), "Glass"),
    part("Cork", [0.34, 0.18, 0.34], [0, 1.4, 0], wood, "Wood"),
    part("Seal", [0.4, 0.2, 0.15], [0, 0.6, -0.38], gold, "Metal"),
  ]),
];
function rig(name: string, c: V, a: V, scale = 1, role = "Enemy", variant = 0): Node {
  const p: Node[] = [
    part("HumanoidRootPart", [2, 2, 1], [0, 3, 0], c, "SmoothPlastic", {
      alpha: 1,
      collide: false,
    }),
    part("Torso", [2, 2, 1], [0, 3, 0], c),
    part("Head", [1.3, 1.2, 1.2], [0, 4.6, 0], role === "NPC" ? rgb(196, 155, 121) : c),
    part("Left Arm", [1, 2, 1], [-1.5, 3, 0], c),
    part("Right Arm", [1, 2, 1], [1.5, 3, 0], c),
    part("Left Leg", [1, 2, 1], [-0.5, 1, 0], rgb(43, 47, 57)),
    part("Right Leg", [1, 2, 1], [0.5, 1, 0], rgb(43, 47, 57)),
    part("Belt", [2.1, 0.25, 1.1], [0, 2.25, 0], gold),
    part("ChestSigil", [0.55, 0.65, 0.12], [0, 3.2, -0.57], a, "Neon"),
    part("Mantle", [2.5, 0.35, 1.2], [0, 3.85, 0], a),
    part("EyeL", [0.16, 0.12, 0.08], [-0.3, 4.7, -0.63], a, "Neon"),
    part("EyeR", [0.16, 0.12, 0.08], [0.3, 4.7, -0.63], a, "Neon"),
  ];
  if (role !== "NPC") {
    for (const s of [-1, 1])
      p.push(
        part("Crown" + s, [0.25, 1.3, 0.3], [s * 0.55, 5.55, 0], a, "Metal", {
          rot: [0, 0, -s * (15 + variant * 4)],
        }),
      );
  }
  if (variant % 3 === 1) p.push(part("Cowl", [1.55, 0.35, 1.5], [0, 5.25, 0], a));
  if (variant % 3 === 2)
    p.push(part("BackCrest", [0.35, 2.5, 0.8], [0, 3.9, 0.8], a, "Metal", { rot: [25, 0, 0] }));
  return model(name, p, {
    kind: "Rig",
    scale,
    attrs: { AssetId: name, Role: role, RigType: "R6", ForwardAxis: "-Z", GroundOffset: 3 * scale },
  });
}
const characters: Node[] = [
  rig("QuestGiver", rgb(51, 91, 105), gold, 1, "NPC"),
  rig("Merchant", rgb(121, 64, 99), gold, 1, "NPC", 1),
  rig("Blacksmith", rgb(74, 62, 53), rgb(218, 122, 55), 1.1, "NPC", 2),
  ...ALL_ENEMIES.map((e, i) =>
    rig(e.id, [...e.color], [...e.accent], e.scale, e.boss ? "Boss" : "Enemy", i),
  ),
];
const tree = model("AncientTree", [
  part("Trunk", [3, 13, 3], [0, 6.5, 0], wood, "Wood"),
  part("BranchL", [1.5, 8, 1.5], [-2, 11, 0], wood, "Wood", { rot: [0, 0, 40] }),
  part("BranchR", [1.5, 8, 1.5], [2, 11, 0], wood, "Wood", { rot: [0, 0, -40] }),
  ...[
    [0, 17, 0],
    [-5, 14, 0],
    [5, 15, 1],
    [0, 15, 4],
  ].map((p, i) =>
    part("Canopy" + i, [12, 8, 11], p as V, rgb(43 + i * 8, 89 + i * 9, 60), "Grass", {
      shape: "Ball",
    }),
  ),
  ...[-1, 1].map((s) =>
    part("Root" + s, [5, 1.2, 2], [s * 2, 0.6, 0], wood, "Wood", { rot: [0, s * 20, 0] }),
  ),
]);
const pillar = model("TempleColumn", [
  part("Foot", [5, 1, 5], [0, 0.5, 0], stone, "Slate"),
  part("Shaft", [2.4, 13, 2.4], [0, 7.5, 0], stone, "Marble", { shape: "Cylinder" }),
  part("Capital", [4.5, 1, 4.5], [0, 14.5, 0], stone, "Marble"),
  part("GoldBand", [2.6, 0.35, 2.6], [0, 12.5, 0], gold, "Metal", { shape: "Cylinder" }),
]);
const lantern = model("WayLantern", [
  part("Post", [0.5, 6, 0.5], [0, 3, 0], wood, "Wood"),
  part("Housing", [1.3, 1.8, 1.3], [0, 6.5, 0], gold, "Metal"),
  part("Glow", [1.1, 1.3, 1.35], [0, 6.5, 0], rgb(255, 208, 128), "Neon", {
    light: 16,
    collide: false,
  }),
  part("Cap", [1.7, 0.3, 1.7], [0, 7.5, 0], wood),
]);
const stall = model("MarketStall", [
  part("Counter", [11, 1, 4], [0, 3, 0], wood, "WoodPlanks"),
  ...[-1, 1].map((s) => part("Leg" + s, [0.6, 6, 0.6], [s * 5, 3, 1], wood, "Wood")),
  part("Canopy", [12, 0.5, 7], [0, 7, 0], rgb(65, 120, 116), "Fabric"),
  ...[-1, 0, 1].map((s) =>
    part("AwningStripe" + s, [1.5, 0.1, 7.1], [s * 3, 7.3, 0], rgb(231, 207, 151), "Fabric"),
  ),
  part("Crate", [2, 2, 2], [-3, 1, -1], wood, "WoodPlanks"),
]);
const scenery = [
  tree,
  pillar,
  lantern,
  stall,
  model("Runestone", [
    part("Stone", [4, 7, 2], [0, 3.5, 0], rgb(87, 102, 110), "Slate"),
    part("Rune", [0.4, 4, 0.1], [0, 4, -1.1], cyan, "Neon", { light: 10 }),
  ]),
];
const assets = folder("GameAssets", [
  folder("Weapons", weapons),
  folder("Items", items),
  folder("Characters", characters),
  folder("Rigs", [rig("ReferenceHumanoid", rgb(151, 160, 171), cyan, 1, "Reference")]),
  folder("Scenery", scenery),
]);
const copy = (name: string, template: string, pos: V, scale = 1): Node => ({
  name,
  clone: template,
  pos,
  scale,
});
const marker = (
  name: string,
  pos: V,
  kind: string,
  region: string,
  more: Record<string, string | number | boolean> = {},
): Node =>
  part(name, [2, 0.2, 2], pos, gold, "SmoothPlastic", {
    alpha: 1,
    collide: false,
    attrs: { MarkerType: kind, RegionId: region, ...more },
  });
const configs = [
  [
    "01_WhisperingWilds",
    "Verdant",
    "WHISPERING WILDS",
    rgb(74, 106, 69),
    rgb(161, 216, 113),
    "Grass",
  ],
  [
    "04_EmberfallCaldera",
    "Ember",
    "EMBERFALL CALDERA",
    rgb(68, 53, 51),
    rgb(255, 111, 42),
    "Basalt",
  ],
  ["03_FrostveilReach", "Frost", "FROSTVEIL REACH", rgb(199, 222, 233), rgb(136, 231, 255), "Snow"],
  ["08_ZephyrMesa", "Storm", "ZEPHYR MESA", rgb(109, 97, 89), rgb(156, 199, 255), "Sandstone"],
  ["10_UmbralHollow", "Umbral", "UMBRAL HOLLOW", rgb(44, 36, 59), rgb(192, 109, 255), "Slate"],
] as const;
function region(index: number): Node {
  const [name, id, title, ground, accent, material] = configs[index];
  const x = index * 360;
  const p: Node[] = [];
  const add = (n: Node) => {
    if (n.pos) n.pos = [n.pos[0] + x, n.pos[1], n.pos[2]];
    p.push(n);
  };
  add(part("Landmass", [340, 20, 280], [0, -9.88, 0], [...ground], material));
  add(
    part("PilgrimRoad", [340, 0.3, 18], [0, 0.15, 0], rgb(165, 151, 124), "Cobblestone", {
      attrs: { RouteId: id + "_Main", Walkable: true },
    }),
  );
  add(part("SanctumApproach", [18, 0.3, 90], [65, 0.15, 45], rgb(165, 151, 124), "Cobblestone"));
  add(part("CampApproach", [18, 0.3, 75], [-85, 0.15, -37], rgb(165, 151, 124), "Cobblestone"));
  add(marker("Entrance", [-165, 1, 0], "Entrance", id, { RouteOrder: index + 1 }));
  add(
    marker("Exit", [165, 1, 0], "Exit", id, {
      NextRegion: index === 4 ? "EndOfAuthoredRoute" : configs[index + 1][1],
    }),
  );
  for (const z of [-1, 1]) {
    add(copy("EntryColumn" + z, "Scenery.TempleColumn", [-152, 0, z * 14]));
    add(
      part("EntryAccent" + z, [2, 9, 0.4], [-152, 8, z * 14 - 1.3], [...accent], "Neon", {
        light: 18,
        collide: false,
      }),
    );
  }
  add(part("EntranceLintel", [6, 3, 34], [-152, 16, 0], [...ground], material));
  add(
    part("RegionSign", [18, 5, 1], [-149, 12, 0], [...ground], material, {
      text: title,
      collide: false,
      rot: [0, 90, 0],
    }),
  );
  add(part("CampSquare", [65, 0.4, 48], [-85, 0.2, -64], rgb(129, 120, 102), "Cobblestone"));
  add(copy("MerchantStall", "Scenery.MarketStall", [-105, 0, -75]));
  add(copy("Merchant", "Characters.Merchant", [-105, 0, -71]));
  add(marker("MerchantLocation", [-105, 1, -66], "Merchant", id));
  add(copy("OraclePavilion", "Scenery.MarketStall", [-67, 0, -75]));
  add(copy("QuestGiver", "Characters.QuestGiver", [-67, 0, -71]));
  add(marker("QuestGiverLocation", [-67, 1, -66], "QuestGiver", id));
  for (const [i, item] of ["HealingPotion", "Coin", "Crystal"].entries())
    add(copy("ShopDisplay" + item, "Items." + item, [-108 + i * 3, 3.5, -75]));
  add(
    part("CampNotice", [12, 4, 0.5], [-85, 4, -88], wood, "Wood", { text: "SANCTUARY • SUPPLIES" }),
  );
  for (const s of [-1, 1])
    add(part("Bench" + s, [9, 1, 2], [-85 + s * 16, 1, -50], wood, "WoodPlanks"));
  for (let j = 0; j < 8; j++)
    add(copy("RoadLantern" + j, "Scenery.WayLantern", [-130 + j * 38, 0, j % 2 ? 13 : -13]));
  add(
    part("BossArena", [82, 0.5, 72], [65, 0.25, 91], [...ground], material, {
      attrs: { MarkerType: "BossArena", RegionId: id },
    }),
  );
  add(
    marker("BossSpawn", [65, 1, 91], "BossSpawn", id, {
      EnemyId: ALL_ENEMIES.find((e) => e.region === id && e.boss)!.id,
    }),
  );
  add(
    copy(
      "BossArtwork",
      "Characters." + ALL_ENEMIES.find((e) => e.region === id && e.boss)!.id,
      [65, 0.5, 105],
    ),
  );
  for (let j = 0; j < 8; j++) {
    const a = (j * Math.PI) / 4;
    if (j === 6) continue;
    add(
      copy(
        "ArenaColumn" + j,
        "Scenery.TempleColumn",
        [65 + Math.cos(a) * 43, 0, 91 + Math.sin(a) * 35],
        0.7,
      ),
    );
  }
  add(
    part("ArenaThreshold", [24, 0.15, 3], [65, 0.6, 57], [...accent], "Neon", { collide: false }),
  );
  const enemies = ALL_ENEMIES.filter((e) => e.region === id && !e.boss);
  for (let j = 0; j < 4; j++) {
    const ex = -20 + j * 35,
      ez = -38 - (j % 2) * 12;
    add(
      marker("EnemySpawn_" + String(j + 1).padStart(2, "0"), [ex, 1, ez], "EnemySpawn", id, {
        EnemyId: enemies[j].id,
      }),
    );
    add(copy("EnemyArtwork_" + enemies[j].id, "Characters." + enemies[j].id, [ex, 0, ez]));
  }
  for (let j = 0; j < 3; j++) {
    const item = (
      index === 0
        ? ["Wood", "Herb", "Crystal"]
        : index === 1
          ? ["Ore", "Crystal", "Ore"]
          : index === 2
            ? ["Crystal", "Ore", "Herb"]
            : index === 3
              ? ["Ore", "Herb", "Crystal"]
              : ["Crystal", "Ore", "Herb"]
    )[j];
    add(
      marker("Gather_" + item + "_" + (j + 1), [-110 + j * 30, 1, 55], "Gathering", id, {
        ResourceId: item,
      }),
    );
    for (let k = 0; k < 3; k++)
      add(
        copy(
          "Resource_" + j + "_" + k,
          "Items." + item,
          [-110 + j * 30 + k * 2, 0, 55 + (k % 2) * 3],
          1.5,
        ),
      );
  }
  if (index === 0) {
    for (let j = 0; j < 28; j++) {
      const xx = -130 + (j % 7) * 42,
        zz = j < 14 ? -110 - (j % 2) * 12 : 70 + (j % 2) * 40;
      if (xx > 15 && zz > 50) continue;
      add(copy("SacredOak" + j, "Scenery.AncientTree", [xx, 0, zz], 0.8 + (j % 3) * 0.2));
    }
    add(copy("Blacksmith", "Characters.Blacksmith", [-122, 0, -40]));
    add(marker("BlacksmithLocation", [-122, 1, -35], "Blacksmith", id));
    add(part("Anvil", [4, 2, 2], [-122, 1, -45], rgb(61, 66, 74), "Metal"));
    for (let j = 0; j < 6; j++)
      add(
        copy(
          "TemplePillar" + j,
          "Scenery.TempleColumn",
          [35 + (j % 3) * 30, 0, 75 + Math.floor(j / 3) * 42],
          1.3,
        ),
      );
    add(part("TemplePediment", [78, 4, 12], [65, 21, 118], stone, "Marble"));
    add(copy("MemoryAltar", "Scenery.Runestone", [65, 0.5, 123], 1.2));
  }
  if (index === 1) {
    for (let j = 0; j < 15; j++)
      add(
        part(
          "ObsidianSpire" + j,
          [12 + (j % 3) * 6, 25 + (j % 4) * 12, 14],
          [-135 + j * 19, 12, -110],
          [...ground],
          "Basalt",
          { rot: [0, 0, ((j % 3) - 1) * 12] },
        ),
      );
    for (let j = 0; j < 5; j++)
      add(
        part("LavaFissure" + j, [24, 0.1, 7], [-95 + j * 48, 0.22, 35], [...accent], "Neon", {
          light: 18,
          collide: false,
          attrs: { VisualOnly: true },
        }),
      );
    add(part("CalderaAltar", [30, 8, 12], [65, 4, 124], rgb(38, 32, 33), "Basalt"));
    for (let j = 0; j < 5; j++)
      add(
        part(
          "CalderaCrown" + j,
          [8, 25 + (j % 2) * 9, 10],
          [29 + j * 18, 12, 131],
          rgb(49, 40, 39),
          "Basalt",
          { rot: [0, 0, (j - 2) * 9] },
        ),
      );
  }
  if (index === 2) {
    for (let j = 0; j < 11; j++) {
      add(
        part(
          "Mountain" + j,
          [43, 60 + (j % 3) * 25, 44],
          [-145 + j * 29, 22, -116],
          rgb(130, 164, 185),
          "Rock",
          { shape: "Wedge", rot: [0, j * 47, 0] },
        ),
      );
      add(
        part(
          "Snowcap" + j,
          [27, 30 + (j % 3) * 12, 28],
          [-145 + j * 29, 45 + (j % 3) * 12, -116],
          [...ground],
          "Snow",
          { shape: "Wedge", rot: [0, j * 47, 0] },
        ),
      );
    }
    add(part("FrozenLake", [70, 0.15, 38], [-78, 0.08, 91], rgb(98, 174, 210), "Ice"));
    for (let j = 0; j < 6; j++)
      add(copy("IceMonolith" + j, "Scenery.Runestone", [25 + j * 16, 0, 128], 1.5));
  }
  if (index === 3) {
    for (let j = 0; j < 9; j++) {
      add(
        part(
          "MesaButte" + j,
          [25, 22 + (j % 3) * 12, 28],
          [-140 + j * 35, 11 + (j % 3) * 6, -115],
          [...ground],
          "Sandstone",
        ),
      );
      add(
        part(
          "MesaCap" + j,
          [31, 3, 34],
          [-140 + j * 35, 23.5 + (j % 3) * 12, -115],
          rgb(181, 157, 125),
          "Sandstone",
        ),
      );
    }
    for (const s of [-1, 1]) {
      add(part("StormPylon" + s, [5, 36, 5], [65 + s * 38, 18, 112], rgb(57, 67, 96), "Metal"));
      add(
        part("StormBeacon" + s, [7, 7, 7], [65 + s * 38, 38, 112], [...accent], "Neon", {
          shape: "Ball",
          light: 35,
        }),
      );
    }
    add(part("SkyDais", [40, 1, 22], [65, 0.5, 114], rgb(123, 146, 172), "Marble"));
  }
  if (index === 4) {
    add(part("CavernRoof", [320, 8, 235], [0, 52, 0], rgb(28, 24, 37), "Slate"));
    for (let j = 0; j < 12; j++)
      add(
        part(
          "CavernRib" + j,
          [8, 50, 12],
          [-155 + (j % 6) * 62, 25, j < 6 ? -118 : 130],
          rgb(38, 30, 48),
          "Slate",
          { rot: [0, 0, (j % 2 ? 1 : -1) * 9] },
        ),
      );
    add(
      part("SoulRiver", [100, 0.12, 20], [-80, 0.08, 95], [...accent], "Neon", {
        light: 30,
        collide: false,
      }),
    );
    add(part("ThroneBack", [16, 24, 6], [65, 12, 124], rgb(24, 20, 31), "Slate"));
    for (let j = 0; j < 5; j++)
      add(
        part(
          "ThroneCrown" + j,
          [2, 10 + (j % 2) * 5, 2],
          [57 + j * 4, 26, 124],
          [...accent],
          "Neon",
          { light: 20 },
        ),
      );
  }
  if (index === 0)
    p.push(
      model(
        "WeaponDisplay",
        weapons.map((w, i) =>
          model(
            w.name,
            w.children!.map((c) => ({
              ...c,
              pos: [x - 126 + i * 2 + c.pos![0], 3.5 + c.pos![1], -47 + c.pos![2]] as V,
              collide: false,
            })),
          ),
        ),
      ),
    );
  const details: Node[] = [];
  for (let j = 0; j < 32; j++) {
    const xx = -143 + (j % 8) * 40,
      zz = j < 16 ? -94 - (j % 2) * 30 : 72 + (j % 2) * 51;
    if ((xx > 15 && zz > 50) || (xx < -40 && zz < -40 && zz > -95)) continue;
    details.push(
      part(
        "Boulder" + j,
        [5 + (j % 3) * 2, 3 + (j % 4), 4 + (j % 3)],
        [x + xx, 1.2, zz],
        [...ground],
        index === 2 ? "Snow" : "Rock",
        { shape: "Ball", rot: [0, j * 37, 0] },
      ),
    );
    if (index === 0)
      details.push(
        copy(
          "Understory" + j,
          "Scenery.AncientTree",
          [x + xx + 9, 0, zz + 4],
          0.45 + (j % 3) * 0.12,
        ),
      );
    if (index > 0)
      details.push(
        part(
          "RelicShard" + j,
          [1, 4 + (j % 3), 1],
          [x + xx + 4, 2, zz],
          [...accent],
          index === 2 ? "Ice" : "Slate",
          { rot: [0, 0, j % 2 ? 20 : -20] },
        ),
      );
  }
  if (index === 3) {
    details.push(
      part("PlateauRamp", [18, 1, 60.3], [x - 72, 3, 55], rgb(163, 147, 124), "Sandstone", {
        rot: [-5.71, 0, 0],
        attrs: { Walkable: true, RouteId: "Storm_Overlook" },
      }),
    );
    details.push(
      part("WalkablePlateau", [60, 7, 42], [x - 72, 3, 106], rgb(163, 147, 124), "Sandstone"),
    );
    details.push(copy("OverlookObelisk", "Scenery.Runestone", [x - 72, 6.5, 115], 1.5));
    details.push(marker("Overlook", [x - 72, 7, 100], "Landmark", id));
  }
  if (index === 4) {
    for (const z of [-139, 139])
      details.push(part("CavernWall" + z, [340, 52, 5], [x, 26, z], rgb(34, 28, 44), "Slate"));
    details.push(
      part("TerminalGate", [5, 3, 22], [x + 167, 17, 0], rgb(34, 28, 44), "Slate", {
        text: "BEYOND THE VEIL",
      }),
    );
  }
  p.push(folder("LandscapeDetails", details));
  return model(name, p, {
    attrs: {
      RegionId: id,
      RegionName: title,
      RouteOrder: index + 1,
      AuthoredBy: "WorldArt",
      ArtVersion: 1,
    },
  });
}
const regions = configs.map((_, i) => region(i));
const connections: Node[] = [];
for (let i = 0; i < 4; i++) {
  connections.push(
    part(
      "Bridge_" + configs[i][1] + "_" + configs[i + 1][1],
      [24, 0.4, 18],
      [180 + i * 360, 0.2, 0],
      wood,
      "WoodPlanks",
      { attrs: { RouteId: "Bridge" + i, Walkable: true } },
    ),
  );
  for (const s of [-1, 1])
    connections.push(
      part("BridgeRail" + i + "_" + s, [25, 2, 0.6], [180 + i * 360, 2, s * 9], gold, "Metal"),
    );
}
// Existing spawn is preserved; a flat road reaches the new sanctuary from its position.
const world = model("EldoriaWorld", [...regions, folder("Connections", connections)], {
  attrs: { AuthoredBy: "WorldArt", ArtVersion: 1 },
});
await Bun.write("assets/eldoria/manifest.json", JSON.stringify({ assets, world }, null, 2));
for (const [i, r] of regions.entries())
  await Bun.write(`assets/eldoria/region-${i}.json`, JSON.stringify(r));
await Bun.write("assets/eldoria/templates.json", JSON.stringify(assets));
console.log(
  "Authored 5 regions, " + characters.length + " character rigs, weapons, items, scenery.",
);
