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
