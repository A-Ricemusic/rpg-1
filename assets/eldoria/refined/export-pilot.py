import bpy, os, json
ROOT=os.path.dirname(os.path.abspath(__file__))
MAT={m.name:m for m in bpy.data.materials}
collections={c.name:c for c in bpy.data.collections}
source=open(os.path.join(ROOT,'blender_art.py')).read()
exec(source[source.index('def export_collection'):source.index('# Convert curves')])
export_collection('Sword')
