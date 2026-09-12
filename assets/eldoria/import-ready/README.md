# Required authenticated import — mesh repair

The current Editor-only mesh transfer is NOT game-ready. Inspection of both Client and Server during Play found MeshContent SourceType=None and empty MeshId. Converting a sword pilot to DataModelContent produced Opaque content in Edit, but it also became None during Play. CreateAssetAsync returned “CreateAssetAsync and CreateAssetVersionAsync are not available yet.” macOS reports UI automation disabled. No API keys or permission changes were made.

## The concrete next step

1. In Studio Edit mode, choose **Home → Import**.
2. Select `Eldoria-import-library.fbx` in this directory.
3. Set **Scale Unit = Stud**, **Import Only as a Model**, and **Upload to Roblox**. Use your own creator identity (or the experience-owning group). Preserve object names. This follows the official Blender/Studio import guidance: https://create.roblox.com/docs/art/blender
4. Import and leave the model in Workspace, named `Eldoria-import-library`. Do not replace GameAssets or move existing weapons/NPCs manually.
5. Tell the world artist the import is present. The artist must inspect mesh IDs and bounds, adopt the meshes using the prepared helper, then test actual Client asset loading and equipped weapons. This file is NOT evidence that the import has happened.

The pack contains 84 mesh components, 103,010 triangles and the four existing baked material sets. Components use `Asset__Material` names and are laid out on a grid. `Eldoria-import-library.blend` and `build_bundle.py` preserve the Blender source. `manifest.json` records the mapping. FBX uses the documented FBX Unit Scale export setting. `bundle-verification.json` records a Blender reimport check only.

## Work completed in Studio

- Tagged 3,168 world/template MeshParts with ImportKey; no unmatched meshes.
- Replaced Grass with Ground in five camps and along walking routes. This removes obstructive grass while preserving terrain occupancy and collision. TerrainBeforePlayabilityRepair in ServerStorage preserves the earlier terrain.
- Existing models, joints and gameplay scripts remain preserved. The failed sword conversion is a pilot only, not a working game asset.

`repair.ts` emits `prepare.luau` and `adopt.luau`. These are edit-time helpers outside Rojo, never runtime scripts. Prepare already ran; do not repeat it. Adopt has NOT run; it requires the actual imported model and preflights all 84 nonempty MeshIds before replacement. After adoption, verify client preload and rendering before marking any asset game-ready.

A manual Save As is still required, but **Save As alone does not repair the current missing mesh content**. Proper import and a fresh Play/reopen test are required.

## Gameplay scope

The user has now explicitly authorized UI, camera and control edits. The client HUD/control repair is implemented and tested; see `docs/handoffs/ui-controls.md`. This approval supersedes the earlier prohibition for that work. It does not make the pending mesh import complete.

Reference: Roblox describes DataModelContent as session-lifetime content: https://devforum.roblox.com/t/4541898 . It is not proof of persistent Editor-to-Play import.

Validation completed: Blender FBX reimport retained all 84 named meshes, 103,010 triangles and 12 images. bun run format, bun run typecheck and bun run lint passed. This is not a Studio import or runtime rendering success.
