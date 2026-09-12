# Eldoria exploration expansion — authored in Studio

This layout replaces the narrow row of region pads with a forest heartland and four surrounding basins. Existing weapons, NPC meshes, joints and gameplay scripts are preserved. Sources and edit-only payloads are under `assets/eldoria/expansion/`; do not sync them as runtime scripts.

| Region            | Center X,Z  | Local footprint |
| ----------------- | ----------- | --------------- |
| Whispering Wilds  | 0,0         | 1152 × 1152     |
| Emberfall Caldera | -1450,-1100 | 1152 × 1152     |
| Frostveil Reach   | 1050,-1550  | 1152 × 1152     |
| Zephyr Mesa       | 1550,650    | 1152 × 1152     |
| Umbral Hollow     | -1150,1250  | 1152 × 1152     |

Each region has a trail loop, two cross-links, three outlying destinations, an elevated vista, preserved camp and relocated boss sanctuary. Four radial roads and four outer roads connect the basins. Terrain forms valleys around routes and higher enclosing ridges. Scenery is grouped into groves, ruins, quarries and trail junctions rather than scattered uniformly.

## Programmer contract

The existing region roots and RegionIds remain. Entrance/Exit are positioned symmetrically around each new center, preserving the current gameplay center calculation. Explicit CampSpawn and BlacksmithLocation markers prevent old fixed-X fallbacks. Existing EnemySpawn_01–04, BossSpawn, MerchantLocation, QuestGiverLocation and gathering markers move with their artwork. Extra gathering markers use the existing MarkerType=Gathering and ResourceId contract and are discoverable by AdventureWorld's scan.

New art-only discovery, trail and vista markers use the EldoriaExplorationMarker tag. They do not implement quests, rewards or fast travel. Roads use EldoriaRoute and carry RouteStart, RouteEnd and RouteWidth attributes for validation and future navigation. Per-region WorldCenter and ExplorationRadius describe the new footprint.

The current gameplay selects the nearest region center and teleports players away from locked regions. That remains unchanged. Future engineering should use authored region volumes/corridors for more precise transition control. The existing five-stage quest progression is unchanged: this geography alone is not evidence of two hours of gameplay. Populate the 15 destinations with side quests, encounter variations, collectibles and meaningful rewards before targeting a two-hour campaign. Profile expanded terrain and repeated mesh foliage on target devices.

## Preservation and save

WorldLayoutArchive_v2 in ServerStorage preserves the previous layout without discovery tags. Original stored weapon/NPC templates are not modified. ServerStorage.TerrainBeforeWorldExpansion stores the pre-edit TerrainRegion (MinCell -600,-20,-600). ServerStorage.AtmosphereBeforeExpansion preserves the earlier atmosphere. No local place-save tool is exposed; manual Studio Save As and a reopen check remain required, especially for object-backed EditableMesh/EditableImage content.

## Execution and verification

Authored in Place1, Studio ID 148b14ba-d9a0-4505-acd4-f689e0fb6b80, PlaceId 0. All five basins and eight connections exist in Studio. Final route graph: one connected component with 99 endpoint junctions; 117 path segments total 36,845 studs. All 3,866 sampled floor/headroom checks passed. Four weapon templates passed anchoring/collision/Handle checks. Fifteen regional discoveries plus eight roadside waystations give 23 discovery markers; there are 45 gathering markers and five vistas.

The initial clearance test caught Oracle counter obstructions; shortcuts were rerouted through camp alleys. Lookout handrails were shortened to open the landing. The Aurora Pass endpoint was extended 100 studs to meet Frost's southern approach. Rock clusters were grounded against multiple terrain samples. Terrain and artwork were visually inspected in all five regions. These are Edit-mode checks, not a fresh live campaign or target-device performance test.

Execution order (edit-time only): prepare.luau; terrain.luau for regionIndex 1–5 and stripIndex 1–6; furnish.luau per region; connections.luau; polish.luau; final-clearance.luau; finish.luau; connection-fix.luau. These scripts are NOT idempotent and must not be rerun on the completed place. The original terrain and layout backups are needed for rollback. author.ts generates the staged payloads; validation.ts and connectivity.ts generate verification payloads. Acquire the filesystem lock and check the active place/Edit state before every bounded Studio operation.

Atmosphere density was lowered to 0.17, haze to 0.6 and glare to 0.1 to make the larger landscape readable. EditableMesh/EditableImage imports were reused; no new Blender imports or gameplay scripts were required for this layout pass.

Final grounding check passed for all 90 interaction/spawn markers, excluding display Humanoids from floor queries. Studio was left in Edit mode and the world-art lock released. Formatting, typecheck and lint passed. Screenshots and JSON check results are retained under assets/eldoria/expansion/. The final lava/soul-pool surface diameter was increased to 124 studs to cover the water fringe.
