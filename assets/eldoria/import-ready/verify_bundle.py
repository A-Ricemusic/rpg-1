import bpy,json
from pathlib import Path
root=Path('/Users/pelicannurse/Documents/RobloxCode/rpg-game-1/assets/eldoria/import-ready')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root/'Eldoria-import-library.fbx'))
meshes=[o for o in bpy.data.objects if o.type=='MESH']
triangles=0
for o in meshes:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
expected={x['key'] for x in json.loads((root/'manifest.json').read_text())}
assert {o.name for o in meshes}==expected
assert len(meshes)==84 and triangles==103010
report={'verifiedIn':'Blender FBX reimport, not Studio','meshes':len(meshes),'triangles':triangles,'images':len(bpy.data.images),'stableNames':True}
(root/'bundle-verification.json').write_text(json.dumps(report,indent=2));print(report,flush=True)
