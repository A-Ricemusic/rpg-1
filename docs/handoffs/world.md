# Eldoria world art handoff

Authored in the connected **rpg-game-1** Studio Edit datamodel (Studio ID `148b14ba-d9a0-4505-acd4-f689e0fb6b80`, PlaceId `0`). Native Roblox instances exist in Studio. No gameplay scripts, runtime world builder, custom animation uploads, or API keys were added by the world artist. Original Baseplate, SpawnLocation, Terrain, camera, and global Lighting settings were preserved.

## Save status — action required

**The authored place has NOT been saved to a verified local file.** Save it in Studio using **File → Save to File / Save As** before closing Studio. Suggested destination: `/Users/pelicannurse/Documents/RobloxCode/rpg-game-1/assets/eldoria/Eldoria-authored.rbxl`. That file does not yet exist.

There is no save tool in the exposed MCP inventory. `game:SavePlace(Enum.SaveFilter.SaveAll)` failed with `Game:SavePlace placeID is not valid!`. macOS denied AppleScript access to Studio's File menu (`osascript is not allowed assistive access`, -1719). No settings or permissions were changed. The Blender and JSON files below are source backups, not a saved Roblox place.

## World and programmer contract

All region roots are `Workspace.EldoriaWorld.<name>`. The level is a compact, furnished native-part environment, with a continuous west-to-east road. Distances use Roblox studs, Y is up, forward on rigs is -Z.

| Region model          | RegionId  | Center X | Landmark / boss                                             |
| --------------------- | --------- | -------: | ----------------------------------------------------------- |
| `01_WhisperingWilds`  | `Verdant` |        0 | Oak grove, ancient temple / `elder_briar`                   |
| `04_EmberfallCaldera` | `Ember`   |      360 | Obsidian ruins, lava fissures / `pyre_tyrant`               |
| `03_FrostveilReach`   | `Frost`   |      720 | Frozen mountain wall, lake, monoliths / `frost_colossus`    |
| `08_ZephyrMesa`       | `Storm`   |     1080 | Mesa buttes, walkable overlook, storm pylons / `skybreaker` |
| `10_UmbralHollow`     | `Umbral`  |     1440 | Walled cavern, soul river, throne / `null_sovereign`        |

Each region has `RegionId`, `RegionName`, `RouteOrder`, `AuthoredBy=WorldArt`, and `ArtVersion=1` attributes. The visual model numbering follows the requested names; route order follows the table. Four bridges live in `Workspace.EldoriaWorld.Connections`. Main roads are 18 studs wide. Each region has a 340 × 280 stud landmass, a camp approach and boss approach. Ground top is Y=0.12; main road top is Y=0.3; arena top is Y=0.5. Existing spawn at (0,0.5,0) remains on the starting road.

Discover markers recursively by the `EldoriaMarker` CollectionService tag or `MarkerType` attribute. Marker parts are invisible, anchored, noncolliding, non-touching, and non-queryable. Positions below are relative to the region's center X; marker Y is approximately 1 unless noted.

| Name                        | MarkerType   | Local X,Z                       | Other attributes                                 |
| --------------------------- | ------------ | ------------------------------- | ------------------------------------------------ |
| `Entrance`                  | `Entrance`   | -165,0                          | `RegionId`, `RouteOrder`                         |
| `Exit`                      | `Exit`       | 165,0                           | `NextRegion`; final exit is `EndOfAuthoredRoute` |
| `QuestGiverLocation`        | `QuestGiver` | -67,-66                         | `RegionId`                                       |
| `MerchantLocation`          | `Merchant`   | -105,-66                        | `RegionId`                                       |
| `BossSpawn`                 | `BossSpawn`  | 65,91                           | `EnemyId`, `RegionId`                            |
| `BossArena`                 | `BossArena`  | 65,91                           | Solid 82 × 72 arena floor, also tagged           |
| `EnemySpawn_01` … `_04`     | `EnemySpawn` | -20,-38; 15,-50; 50,-38; 85,-50 | Exact existing `EnemyId` values                  |
| `Gather_<Resource>_<1–3>`   | `Gathering`  | -110,55; -80,55; -50,55         | `ResourceId`, `RegionId`                         |
| `BlacksmithLocation`        | `Blacksmith` | -122,-35                        | Starting region only                             |
| `LandscapeDetails.Overlook` | `Landmark`   | -72,100, Y=7                    | Storm only                                       |

Gathering resources by region: Verdant Wood/Herb/Crystal; Ember Ore/Crystal/Ore; Frost Crystal/Ore/Herb; Storm Ore/Herb/Crystal; Umbral Crystal/Ore/Herb.

`QuestGiver`, `Merchant`, `EnemyArtwork_<enemy_id>`, and `BossArtwork` are placed art copies. They are **not live quest, merchant, combat, or gathering systems**. Hook existing gameplay up to the markers/templates. Placed characters use anchored roots and contain Humanoids, Animator, joints, and welded art, with no AI scripts. Boss display copies stand toward the rear of their arenas; spawn markers designate arena centers. Rename/hide/remove display copies when spawning live enemies to avoid duplicates.

## Reusable assets

All templates live below `ReplicatedStorage.GameAssets`:

- `Weapons`: **Sword, Trident, Bow, Arrow** — actual Tool instances, each with a direct `Handle`, welded parts, unanchored/massless/noncolliding equipment geometry. These can be cloned to a Backpack and equipped using Roblox's Tool mechanism; combat actions remain the engineer's responsibility.
- `Items`: **Wood, Ore, Crystal, Herb, Coin, HealingPotion** — small model templates, approximately 0.9–2 studs high. Placed gathering copies are 1.5× scale.
- `Characters`: **QuestGiver, Merchant, Blacksmith**, all **20 ordinary enemies**, and **five bosses**, using the exact IDs in `src/ReplicatedStorage/Shared/EnemyConfig.ts`. Ordinary enemies range from 0.8× to 1.2×; bosses 2.2× to 2.7×.
- `Rigs.ReferenceHumanoid`: reusable R6 reference humanoid for later animation work.
- `Scenery`: **AncientTree, TempleColumn, WayLantern, MarketStall, Runestone**. World copies reuse these designs. Region-specific ground and landmark pieces are in their region models, with smaller details in `LandscapeDetails`.

A static equipment showcase is at `Workspace.EldoriaWorld.01_WhisperingWilds.WeaponDisplay`, beside the blacksmith. It contains anchored art models; use the Tools in ReplicatedStorage for equipment.

### Equipment grip convention

`Handle.GripAttachment` and `Handle.RightGripAttachment` are at the handle center with identity orientation. Local +Y follows the blade/shaft; local -Z is forward. Tools retain identity `Grip`. Sword spans about 5.1 studs including hilt; Trident about 7.4; Bow about 5; Arrow about 3. Body scale is approximately a six-stud reference humanoid.

Sword/Trident/Arrow have `Handle.TipAttachment` at local Y=4.45/6.2/1.9 respectively. Bow has `Handle.ArrowNockAttachment` at the grip origin. For a projectile, orient the arrow's +Y along travel; the art's long axis is not -Z. Final combat and aiming offsets should be tuned by the gameplay engineer against their character/controller.

### Rig joints and attachments

The R6 rigs use `HumanoidRootPart`, `Torso`, `Head`, `Left Arm`, `Right Arm`, `Left Leg`, `Right Leg`. Six Motor6Ds: **RootJoint, Neck, Left Shoulder, Right Shoulder, Left Hip, Right Hip**. Part0/Part1 follow the conventional root→torso, torso→head/limb hierarchy. C0/C1 encode the authored upright rest pose; no stock-animation compatibility claim is made for these custom joint bases.

Base rest positions: root/torso Y=3, head Y=4.6, arm centers X=±1.5/Y=3, leg centers X=±0.5/Y=1. Joint centers: root (0,3,0), neck (0,4,0), shoulders (±1,4,0), hips (±0.5,2,0). Accessories are welded to torso or head. Boss scale multiplies these offsets.

`Right Arm.RightGripAttachment` and `Left Arm.LeftGripAttachment` are local (0,-1,0); `Head.HatAttachment` is (0,0.6,0); `Torso.BodyBackAttachment` is (0,0,0.5); `HumanoidRootPart.RootAttachment` is at origin. Scale applies to attachments. PrimaryPart is HumanoidRootPart, with PivotOffset toward the feet, so `PivotTo` positions the rig at ground level. Unanchor its root and configure collision behavior when enabling live gameplay. Blender character sources contain editable artwork geometry; the actual animation joints are in Studio.

## Blender and import evidence

- `assets/eldoria/author.ts`: TypeScript offline art manifest authoring. Run with `bun assets/eldoria/author.ts`; this writes JSON only and does not touch Studio.
- `manifest.json`, `templates.json`, `region-0.json` … `region-4.json`: declarative source geometry, colors, materials, attributes, clone references, scales.
- `blender_source.py`: Blender-only source conversion, preserving Roblox stud scale and mapping (X,Y,Z) to Blender (X,-Z,Y).
- `Sword-pilot.blend`, `Sword-pilot.obj`, `Sword-pilot.mtl`: **one local import pilot**, exported successfully by Blender.
- `Eldoria-art-sources.blend`: editable collections for all templates and five regions, including placed art copies.

**No Blender mesh was imported into Studio.** The exposed tools provide asset-ID insertion and AI generation, but no local-file 3D importer. In MCP's execution context `AssetImportService` was unavailable (returned nil) and no plugin object was exposed. Studio's authenticated local importer could not be operated through these tools. Therefore a successful local-model import could not be proven, and no large mesh-export batch was produced. The one Sword OBJ remains ready for manual **File → Import** later. Every current Studio asset is the native Roblox-part version, with no external mesh asset dependency. [Roblox importer documentation](https://github.com/Roblox/creator-docs/blob/main/content/en-us/studio/importer.md).

The Blender mirror is an artwork source, not a native Roblox rig or a saved place. SurfaceGui text, lights, joints, tags, and collision metadata are authored in Studio/JSON and are not reproduced as functional Roblox components in Blender.

## Validation and coordination

Studio screenshots inspected the starting region and all four additional regions. Corrections included baseplate z-fighting, scaled rig grounding, sign orientation, exposed lava surfaces, and mesa cap placement. Initial Studio validation sampled 648 positions along the complete main road and all camp/boss branches: no missing floors or collidable obstructions in a 4-stud-wide, 5-stud-high clearance box. All four Tools passed handle/grip/anchoring/collision checks, and all 28 character templates had six Motor6Ds and a PrimaryPart. No LuaSourceContainers were added under EldoriaWorld.

These are Edit-mode geometry checks, not a live combat or player-controller playtest. Global Lighting remains unchanged; authored PointLights and emissive elements distinguish regions. Lava/soul-water details are visual art without damage scripts. Geometry is deliberately compact and uses native parts rather than imported meshes.

The filesystem lock `.agent-studio-lock` was used for bounded Studio operations and released afterward. One early capability check accidentally made two read-only calls after a failed lock acquisition; no mutation occurred, and all subsequent Studio calls were gated on successful acquisition. Other agents' locks were never removed. Gameplay engineer files appearing during this work were left to their owner.

### Final validation results

After enabling solid collision on 357 structural scenery pieces, a temple pillar intruded into the boss approach. It was moved 15 studs east, and all **648 route-clearance samples passed again with zero obstructions**. The storm overlook was sampled at 39 positions; maximum floor-height change was 0.483 studs over a two-stud interval. Final counts: **1,943 world BaseParts**, **3,053 world descendants**, **1,153 template descendants**, **67 tagged markers**. The overlook is reached by an approximately 5.71-degree ramp. Reusable character templates and decorative placed art are excluded from physical route obstructions.

`bun run format`, `bun run typecheck`, and `bun run lint` all completed successfully. No gameplay implementation was authored or changed by this art task; concurrent gameplay changes in the shared repository remain with the gameplay engineer.
