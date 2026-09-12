> **September 12 runtime correction:** The earlier Edit-only mesh checks did not establish usable game assets. The weapon meshes were observed with empty MeshContent in both Client and Server during Play. Save As alone will not fix this. See [the required import repair](../../assets/eldoria/import-ready/README.md). Camps and routes have now had obstructive grass removed; proper FBX import and client verification remain outstanding.

# Eldoria world handoff — September 12 expansion

The actual Studio world now uses a forest heartland, four surrounding terrain basins, four radial roads and four outer connections. Each basin is 1,152 × 1,152 studs: approximately 14× the area of its former 340 × 280 pad. Weapons and existing NPC artwork were preserved. No gameplay scripts or runtime world builder were added.

See [world-expansion.md](world-expansion.md) for authoring stages, validation and engineering notes. [world-v2.md](world-v2.md) is historical and contains the superseded linear layout.

## Save status — manual action required

The connected place is **Place1**, Studio ID `148b14ba-d9a0-4505-acd4-f689e0fb6b80`, PlaceId **0**. The expansion exists in its Edit datamodel. **No local .rbxl save has been verified.** Use Studio's Save As / Save to File before closing; suggested destination: `assets/eldoria/Eldoria-authored.rbxl` in this project. The exposed MCP tools cannot save this unpublished place. The prior SavePlace attempt failed because PlaceId is invalid; macOS UI automation lacked accessibility access.

Blender meshes and baked textures currently use live EditableMesh/EditableImage content. Verify them after reopening a saved copy. Local Blender, FBX, geometry JSON, image and expansion sources are durable backups, but are not a saved Roblox place.

## Region and marker contract

Region roots are under `Workspace.EldoriaWorld`:

| Region model          | RegionId | Center X,Z  |
| --------------------- | -------- | ----------- |
| `01_WhisperingWilds`  | Verdant  | 0,0         |
| `04_EmberfallCaldera` | Ember    | -1450,-1100 |
| `03_FrostveilReach`   | Frost    | 1050,-1550  |
| `08_ZephyrMesa`       | Storm    | 1550,650    |
| `10_UmbralHollow`     | Umbral   | -1150,1250  |

Each region has `WorldCenter`, `ExplorationRadius=576`, `RegionId`, `RouteOrder` and `ArtVersion=3`. Progression order remains Verdant → Ember → Frost → Storm → Umbral. Geometry is no longer arranged in that order along X.

Marker coordinates below are local to each region center; Y is approximately 1. Existing gameplay markers retain their names and attributes. They are invisible and noncolliding. Discover gameplay markers by `MarkerType` and the existing `EldoriaMarker` tag; new exploration markers use `EldoriaExplorationMarker`.

| Marker                             | Local X,Z                             | Purpose                                                       |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| `Entrance` / `Exit`                | -480,0 / 480,0                        | Their midpoint preserves gameplay's region center calculation |
| `CampSpawn`                        | -85,-52                               | Explicit spawn avoids old coordinate fallbacks                |
| `MerchantLocation`                 | -105,-66                              | Existing merchant location                                    |
| `QuestGiverLocation`               | -67,-66                               | Existing Oracle location                                      |
| `BlacksmithLocation`               | -122,-35                              | Explicit in all five regions                                  |
| `BossSpawn` / `BossArena`          | 280,290                               | Existing boss IDs and relocated temple/arena artwork          |
| `EnemySpawn_01–04`                 | -220,210; 170,-295; 375,-170; 265,205 | Existing enemy IDs, artwork and encounter clearings           |
| Original `Gather_<Resource>_<1–3>` | -380,-220; 110,-310; -310,160         | Three regional destination centers                            |
| `Gather_<Resource>_Site<i>_<j>`    | ±14 X, +10 Z from destination         | Six additional gather nodes per region                        |
| `Vista_<RegionId>`                 | 455,187, Y=29                         | Optional raised lookout, reached by a ramp                    |

Gather markers carry `ResourceId`. There are 45 total. Placed enemy/boss copies remain display art; existing gameplay hides/replaces them during Play. CampSpawn and BlacksmithLocation are explicit so the old hardcoded fallback X coordinates are not needed.

## World organization

Each region's `ExpansiveLandscape` contains `Routes`, `Scenery` and `PlacesOfInterest`. Looped trails connect the preserved settlement, three outlying destinations and boss sanctuary. Groves, ruins, quarry faces and ridge groups frame locations. Hills keep destinations from all being visible at once. Each region has a pond/basin treatment; Ember adds a lava surface, Frost ice, and Umbral an emissive soul pool.

| Region  | Three outlying destinations                               |
| ------- | --------------------------------------------------------- |
| Verdant | Dryad Orchard, Mosswater Abbey, Old Pilgrim Quarry        |
| Ember   | Cinder Foundry, Ashen Monastery, Obsidian Excavation      |
| Frost   | Aurora Observatory, Buried Scriptorium, Blueice Mine      |
| Storm   | Eaglewatch Terrace, Stormglass Cloister, Thunderstone Dig |
| Umbral  | Ferryman Rest, Archive of Echoes, Soulstone Hollow        |

`WorldTrails` contains CinderPass, AuroraPass, ZephyrCauseway, VeilwoodDescent, NorthernPilgrimWay, EasternSkyroad, SouthernSoulroad and WesternAshroad. Each has a `PilgrimWaystation`. Fifteen destinations plus eight waystations provide **23 discovery markers**. These are authored places, not implemented side quests or rewards.

Roads carry `EldoriaRoute`, `RouteStart`, `RouteEnd` and `RouteWidth`. Final graph: **one connected component, 99 junctions, 117 segments, 36,845 studs of centerline**. All **3,866 floor/headroom samples passed** after fixing camp shortcuts, lookout landings and the Frost connection. All five regions were visually inspected. These are Edit-mode checks; a fresh campaign/controller playtest and device profiling remain outstanding.

The current gameplay uses nearest-center region selection and existing progression locks. For more precise boundaries, the engineer should adopt region volumes and transition corridors. The five-stage quest system is unchanged. A two-hour campaign still needs side quests, varied encounters, rewards and playtesting; larger geography alone does not establish that duration.

## Reusable assets and sources

Under `ReplicatedStorage.GameAssets`:

- `Weapons`: Sword, Trident, Bow, Arrow — original functional Tools with Blender mesh visuals; Handle/grip/joint conventions retained.
- `Items`: Wood, Ore, Crystal, Herb, Coin, HealingPotion.
- `Characters`: QuestGiver, Merchant, Blacksmith, the 20 exact ordinary enemy IDs and five boss IDs from EnemyConfig.
- `Rigs.ReferenceHumanoid`: R6 reference rig.
- `Scenery` and `RefinedArt`: reusable Blender scenery and component models. RefinedArt retains 31 models / 84 source MeshParts / 103,010 source triangles; repeated world copies are additional.
- `SurfaceTemplates` and `CompiledBlenderSurfaces`: locally transferred baked materials. Uploaded texture IDs failed preload; displayed textures use EditableImages.

`assets/eldoria/refined/Eldoria-refined-library.blend` and `Moonblade-pilot.blend` preserve Blender artwork. Corresponding FBX exports and geometry transfer JSON are retained. The meshes were transferred through EditableMesh after a successful pilot; the tools could not operate the local FBX importer. No API key was used.

`assets/eldoria/expansion/` contains TypeScript offline authoring, edit-time Luau payloads, verification, map and Studio evidence. Never install these payloads as runtime Scripts. `WorldLayoutArchive_v2` and `TerrainBeforeWorldExpansion` in ServerStorage preserve the pre-expansion layout/terrain. `AtmosphereBeforeExpansion` preserves the earlier atmosphere. Earlier art archives are also retained.

### Equipment grip convention

`Handle.GripAttachment` and `Handle.RightGripAttachment` are at the handle center with identity orientation. Local +Y follows the blade/shaft; local -Z is forward. Tools retain identity `Grip`. Sword spans about 5.6 studs including hilt; Trident about 7.7; Bow about 5.6; Arrow about 3.2. Body scale is approximately a six-stud reference humanoid.

Sword/Trident/Arrow have `Handle.TipAttachment` at local Y=4.65/6.05/1.8 respectively. Bow has `Handle.ArrowNockAttachment` at the grip origin. For a projectile, orient the arrow's +Y along travel; the art's long axis is not -Z. Final combat and aiming offsets should be tuned by the gameplay engineer against their character/controller.

### Rig joints and attachments

The R6 rigs use `HumanoidRootPart`, `Torso`, `Head`, `Left Arm`, `Right Arm`, `Left Leg`, `Right Leg`. Six Motor6Ds: **RootJoint, Neck, Left Shoulder, Right Shoulder, Left Hip, Right Hip**. Part0/Part1 follow the conventional root→torso, torso→head/limb hierarchy. C0/C1 encode the authored upright rest pose; no stock-animation compatibility claim is made for these custom joint bases.

Base rest positions: root/torso Y=3, head Y=4.6, arm centers X=±1.5/Y=3, leg centers X=±0.5/Y=1. Joint centers: root (0,3,0), neck (0,4,0), shoulders (±1,4,0), hips (±0.5,2,0). Accessories are welded to torso or head. Boss scale multiplies these offsets.

`Right Arm.RightGripAttachment` and `Left Arm.LeftGripAttachment` are local (0,-1,0); `Head.HatAttachment` is (0,0.6,0); `Torso.BodyBackAttachment` is (0,0,0.5); `HumanoidRootPart.RootAttachment` is at origin. Scale applies to attachments. PrimaryPart is HumanoidRootPart, with PivotOffset toward the feet, so `PivotTo` positions the rig at ground level. Unanchor its root and configure collision behavior when enabling live gameplay. Blender character sources contain editable artwork geometry; the actual animation joints are in Studio.

Final grounding check passed for all 90 interaction/spawn markers, excluding display Humanoids from floor queries. Studio was left in Edit mode and the world-art lock released. Formatting, typecheck and lint passed. Screenshots and JSON check results are retained under assets/eldoria/expansion/. The final lava/soul-pool surface diameter was increased to 124 studs to cover the water fringe.
