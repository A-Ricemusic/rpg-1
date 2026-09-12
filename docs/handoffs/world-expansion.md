# Eldoria exploration expansion — authoring in progress

This layout replaces the narrow row of region pads with a forest heartland and four surrounding basins. Existing weapons, NPC meshes, joints and gameplay scripts are preserved. Sources and edit-only payloads are under `assets/eldoria/expansion/`; do not sync them as runtime scripts.

| Region | Center X,Z | Local footprint |
| --- | --- | --- |
| Whispering Wilds | 0,0 | 1152 × 1152 |
| Emberfall Caldera | -1450,-1100 | 1152 × 1152 |
| Frostveil Reach | 1050,-1550 | 1152 × 1152 |
| Zephyr Mesa | 1550,650 | 1152 × 1152 |
| Umbral Hollow | -1150,1250 | 1152 × 1152 |

Each region has a trail loop, two cross-links, three outlying destinations, an elevated vista, preserved camp and relocated boss sanctuary. Four radial roads and four outer roads connect the basins. Terrain forms valleys around routes and higher enclosing ridges. Scenery is grouped into groves, ruins, quarries and trail junctions rather than scattered uniformly.

## Programmer contract

The existing region roots and RegionIds remain. Entrance/Exit are positioned symmetrically around each new center, preserving the current gameplay center calculation. Explicit CampSpawn and BlacksmithLocation markers prevent old fixed-X fallbacks. Existing EnemySpawn_01–04, BossSpawn, MerchantLocation, QuestGiverLocation and gathering markers move with their artwork. Extra gathering markers use the existing MarkerType=Gathering and ResourceId contract and are discoverable by AdventureWorld's scan.

New art-only discovery, trail and vista markers use the EldoriaExplorationMarker tag. They do not implement quests, rewards or fast travel. Roads use EldoriaRoute and carry RouteStart, RouteEnd and RouteWidth attributes for validation and future navigation. Per-region WorldCenter and ExplorationRadius describe the new footprint.

The current gameplay selects the nearest region center and teleports players away from locked regions. That remains unchanged. Future engineering should use authored region volumes/corridors for more precise transition control. The existing five-stage quest progression is unchanged: this geography alone is not evidence of two hours of gameplay. Populate the 15 destinations with side quests, encounter variations, collectibles and meaningful rewards before targeting a two-hour campaign. Profile expanded terrain and repeated mesh foliage on target devices.

## Preservation and save

WorldLayoutArchive_v2 in ServerStorage preserves the previous layout without discovery tags. Original stored weapon/NPC templates are not modified. Terrain changes require a pre-edit snapshot. No local place-save tool is exposed; manual Studio Save As and a reopen check remain required, especially for object-backed EditableMesh/EditableImage content.

## Execution and verification

Pending Studio lock and actual execution. This document describes the prepared layout, not yet completed content.
