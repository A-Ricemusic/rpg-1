> Historical handoff: layout coordinates below were superseded by the September 12 expansion. See world.md.

# Eldoria world art handoff

Authored in the connected **Place1** (originally **rpg-game-1**) Studio Edit datamodel (Studio ID `148b14ba-d9a0-4505-acd4-f689e0fb6b80`, PlaceId `0`). Native Roblox instances exist in Studio. No gameplay scripts, runtime world builder, custom animation uploads, or API keys were added by the world artist. Original gameplay content was preserved. Baseplate is visually hidden with collision retained. Previous lighting values are in ServerStorage.LightingBeforeRefinedArt.

## Save status — action required

**The authored place has NOT been saved to a verified local file.** Save it in Studio using **File → Save to File / Save As** before closing Studio. Suggested destination: `/Users/pelicannurse/Documents/RobloxCode/rpg-game-1/assets/eldoria/Eldoria-authored.rbxl`. That file does not yet exist.

There is no save tool in the exposed MCP inventory. `game:SavePlace(Enum.SaveFilter.SaveAll)` failed with `Game:SavePlace placeID is not valid!`. macOS denied AppleScript access to Studio's File menu (`osascript is not allowed assistive access`, -1719). No settings or permissions were changed. The Blender and JSON files below are source backups, not a saved Roblox place.

## World and programmer contract

All region roots are `Workspace.EldoriaWorld.<name>`. The level is a compact environment with Blender mesh scenery over native collision geometry, with a continuous west-to-east road. Distances use Roblox studs, Y is up, forward on rigs is -Z.

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

`Handle.GripAttachment` and `Handle.RightGripAttachment` are at the handle center with identity orientation. Local +Y follows the blade/shaft; local -Z is forward. Tools retain identity `Grip`. Sword spans about 5.6 studs including hilt; Trident about 7.7; Bow about 5.6; Arrow about 3.2. Body scale is approximately a six-stud reference humanoid.

Sword/Trident/Arrow have `Handle.TipAttachment` at local Y=4.65/6.05/1.8 respectively. Bow has `Handle.ArrowNockAttachment` at the grip origin. For a projectile, orient the arrow's +Y along travel; the art's long axis is not -Z. Final combat and aiming offsets should be tuned by the gameplay engineer against their character/controller.

### Rig joints and attachments

The R6 rigs use `HumanoidRootPart`, `Torso`, `Head`, `Left Arm`, `Right Arm`, `Left Leg`, `Right Leg`. Six Motor6Ds: **RootJoint, Neck, Left Shoulder, Right Shoulder, Left Hip, Right Hip**. Part0/Part1 follow the conventional root→torso, torso→head/limb hierarchy. C0/C1 encode the authored upright rest pose; no stock-animation compatibility claim is made for these custom joint bases.

Base rest positions: root/torso Y=3, head Y=4.6, arm centers X=±1.5/Y=3, leg centers X=±0.5/Y=1. Joint centers: root (0,3,0), neck (0,4,0), shoulders (±1,4,0), hips (±0.5,2,0). Accessories are welded to torso or head. Boss scale multiplies these offsets.

`Right Arm.RightGripAttachment` and `Left Arm.LeftGripAttachment` are local (0,-1,0); `Head.HatAttachment` is (0,0.6,0); `Torso.BodyBackAttachment` is (0,0,0.5); `HumanoidRootPart.RootAttachment` is at origin. Scale applies to attachments. PrimaryPart is HumanoidRootPart, with PivotOffset toward the feet, so `PivotTo` positions the rig at ground level. Unanchor its root and configure collision behavior when enabling live gameplay. Blender character sources contain editable artwork geometry; the actual animation joints are in Studio.

# Refined Blender artwork — completed transfer

31 Blender asset models, 84 source MeshParts and 103,010 source triangles exist in Studio under `ReplicatedStorage.GameAssets.RefinedArt`. Copies furnish all five regions and skin the functional weapon, item and character templates. Counts exclude repeated world copies.

The Moonblade pilot was transferred and inspected before the larger batch. The tools could not operate Studio's local-file importer, so Blender vertices, split normals, UVs and triangles were transferred through EditableMesh and CreateMeshPartAsync. This is actual Blender geometry, not a Part approximation or a claim that FBX files were imported. No API key was used.

## Sources and evidence

- `Moonblade-pilot.blend`, `Eldoria-refined-library.blend`: editable sources and 31 corresponding FBX exports.
- `blender_art.py`, `environment_art.py`: curved quillons, wrapped grips, gem settings, branching trees with individual leaves, masonry arches, columns, sculpted crags, pavilions, armor and boss crowns.
- `Surface-bakes.blend`, `bake-surfaces.py`, `textures/`: Blender color, normal and roughness bakes for sandstone, bark, basalt and mesa rock.
- `meshes/`, `transfer/`, `prepare-transfer.ts`, `studio-transfer.ts`: geometry and bounded edit-time transfer payloads.
- `prepare-textures.ts`, `texture-transfer/`: baked-image transfer data.
- `studio-adopt.ts`, `studio-place.ts`: edit-time assembly helpers outside Rojo gameplay directories. Never install these as runtime scripts.
- `Studio-sanctuary.png`, `Studio-temple.png`: actual final Studio captures. Other preview PNGs are Blender renders.

RefinedArt names: Sword, Trident, Bow, Arrow, MoonGate, ElderOak, FernCluster, WayShrine, RuinedColumn, VolcanicCrag, GlacialCrag, MesaCrag, UnderworldCrag, StormObelisk, MerchantPavilion, HealingPotion, Crystal, Ore, Wood, Coin, Herb, ArmorTorso, ArmorArm, ArmorLeg, ArmorHead, CivilianHead, BriarCrown, PyreCrown, FrostCrown, StormCrown, VoidCrown.

Each region's `RefinedLandscape` contains entrance and sanctum MoonGates, a ridge and ground rocks. Forest adds groves and ferns; Ember and Frost have towering sanctum crags; Storm has twin lightning conductors; Umbral has the SovereignReliquary. Boss crowns distinguish branching antlers, ram horns/flames, an ice fan, winged solar halo and broken void halo. NPCs use human faces and fabric clothing; enemies use armored mesh skins. Replacement artwork carries ArtVersion 2; original region root attributes retain version 1.

Original visual Parts are hidden as needed, retaining structural collision proxies and marker positions. `ServerStorage.WorldArtArchive_v1` preserves pre-replacement art with discovery tags removed. `ServerStorage.RefinedPrototypeArchive` holds superseded prototypes. The underlying layout remains compact and mostly level; this pass improves artwork rather than creating a fully sculpted open landscape.

## Texture and persistence limitations

Authenticated image upload returned IDs in `published-textures.json`, but those IDs failed preload. Visible materials instead use locally transferred EditableImages: 256-pixel color/normal maps and constant roughness, retained in `GameAssets.SurfaceTemplates` and `CompiledBlenderSurfaces`. Mesh TextureContent and SurfaceAppearance reference these images. Original bakes are 512 pixels. Final Studio captures confirm bark and stone colors render.

MeshContent references live EditableMesh objects. CreateAssetAsync failed with “CreateAssetAsync and CreateAssetVersionAsync are not available yet.” **Saving and reopening these object-backed meshes/images has not been verified.** Save through Studio and verify a reopened copy before treating it as durable. Blender, FBX, geometry JSON and image sources are durable backups. No verified .rbxl file has been produced; manual Save As is required.

## Validation

All five regions were inspected in Studio. Edit-mode validation passed 648 route-clearance samples with no missing floors or collidable obstructions. Four weapons passed unanchored/noncolliding assembly checks; all 28 character templates retained six Motor6Ds and a PrimaryPart. There are 67 tagged markers. Storm overlook passed 39 floor samples, maximum rise 0.483 studs per two-stud interval. Four final sanctuary trees are noncolliding.

These checks do not establish live controller/combat behavior, mobile performance or persistent publishing. Repeated detailed foliage needs profiling on target devices. Lighting now uses late-afternoon sun, restrained bloom and regional emissive lights. No gameplay scripts were authored or changed.

The exclusive filesystem lock was acquired for bounded Studio operations, with place/edit-state checks, and released afterward. Other agents' locks were never removed. One early read-only capability check ran after a failed acquisition; no mutation occurred and subsequent calls were gated correctly. Concurrent gameplay changes remain owned by the gameplay engineer.

Final repository checks: `bun run format`, `bun run typecheck`, and `bun run lint` completed successfully after the refined art pass.
