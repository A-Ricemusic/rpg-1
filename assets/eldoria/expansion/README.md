# Eldoria expansion sources

Actual content is authored in the connected Studio under Workspace.EldoriaWorld. The map is now a heartland and four surrounding basins, with radial and outer routes. See ../../../docs/handoffs/world.md for the current contract and save limitations.

- author.ts generates prepare, terrain, furnish, connections, polish and finish Luau payloads using Bun. These are bounded EDIT-TIME payloads only. Never install them as runtime scripts or sync this directory with Rojo.
- final-clearance.luau and connection-fix.luau preserve the corrections found by Studio validation.
- validation.ts checks real route floor/headroom; connectivity.ts checks route endpoint connectivity; markers.ts checks interaction/spawn marker grounding while excluding display character bodies.
- World-map.svg is an organization diagram. Studio-*.png are actual Studio screenshots.
- validation-result.json records the final route check.

The payloads are not idempotent. Do not rerun them on the completed world. The pre-expansion world and terrain are archived in Studio. Acquire .agent-studio-lock atomically and verify the intended place and Edit state before any Studio operation. Never remove another agent's lock.

The existing Blender library under ../refined/ supplies the mesh artwork. No weapon or existing character templates were changed by the expansion. EditableMesh/EditableImage persistence still requires a manual place save and reopen verification.
