"""Art-only Blender mirror of author.ts's declarative geometry; not a game script.
Run with Blender --background --python assets/eldoria/blender_source.py.
Coordinates preserve Roblox stud units and convert Y-up to Blender Z-up.
"""
import bpy, json, math, os
from mathutils import Matrix
ROOT=os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(ROOT,'manifest.json')) as f: data=json.load(f)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
materials={}
def material(n):
    c=tuple(n.get('color',[140,140,140])); key=(c,n.get('material'))
    if key not in materials:
        m=bpy.data.materials.new(str(key));m.diffuse_color=(*[x/255 for x in c],1);m.use_nodes=True
        bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=m.diffuse_color
        bs.inputs['Metallic'].default_value=.7 if key[1]=='Metal' else 0
        bs.inputs['Roughness'].default_value=.28 if key[1] in ['Metal','Glass','Ice'] else .8
        if key[1]=='Neon': bs.inputs['Emission Color'].default_value=m.diffuse_color;bs.inputs['Emission Strength'].default_value=2
        materials[key]=m
    return materials[key]
convert=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
def mesh(n,collection,offset=(0,0,0),scale=1):
    if n.get('alpha',0)==1:return
    p=n.get('pos',[0,0,0]);s=n['size'];shape=n.get('shape')
    if shape=='Ball':bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6)
    elif shape=='Cylinder':bpy.ops.mesh.primitive_cylinder_add(vertices=12)
    else:bpy.ops.mesh.primitive_cube_add()
    o=bpy.context.object;o.name=n['name'];o.dimensions=(s[0]*scale,s[2]*scale,s[1]*scale)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if shape=='Wedge':
        for v in o.data.vertices:
            if v.co.z>0 and v.co.y<0:v.co.z=-s[1]*scale/2
    rot=n.get('rot',[0,0,0]);r=Matrix.Rotation(math.radians(rot[0]),4,'X')@Matrix.Rotation(math.radians(rot[1]),4,'Y')@Matrix.Rotation(math.radians(rot[2]),4,'Z')
    o.matrix_world=convert@r@convert.inverted()
    o.location=(offset[0]+p[0]*scale,-offset[2]-p[2]*scale,offset[1]+p[1]*scale)
    o.data.materials.append(material(n));o['StudioPartName']=n['name'];o['StudioMaterial']=n.get('material','SmoothPlastic')
    for c in list(o.users_collection):c.objects.unlink(o)
    collection.objects.link(o)
lookup={}
for f in data['assets']['children']:
    for n in f['children']:lookup[f['name']+'.'+n['name']]=n
def visit(n,col,offset=(0,0,0),scale=1):
    if 'clone' in n:
        p=n['pos'];visit(lookup[n['clone']],col,tuple(offset[i]+p[i]*scale for i in range(3)),scale*n.get('scale',1));return
    scale*=n.get('scale',1)
    if 'size'in n:mesh(n,col,offset,scale)
    for c in n.get('children',[]):visit(c,col,offset,scale)
# One pilot export first; the remaining scene is a source archive, not imported meshes.
pilot=bpy.data.collections.new('Sword_ImportPilot');bpy.context.scene.collection.children.link(pilot)
visit(lookup['Weapons.Sword'],pilot)
bpy.ops.object.select_all(action='DESELECT')
for o in pilot.objects:o.select_set(True)
bpy.ops.wm.obj_export(filepath=os.path.join(ROOT,'Sword-pilot.obj'),export_selected_objects=True,forward_axis='NEGATIVE_Z',up_axis='Y')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Sword-pilot.blend'))
for key,n in lookup.items():
    if key=='Weapons.Sword':continue
    col=bpy.data.collections.new(key);bpy.context.scene.collection.children.link(col);visit(n,col)
for n in data['world']['children']:
    col=bpy.data.collections.new(n['name']);bpy.context.scene.collection.children.link(col);visit(n,col)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Eldoria-art-sources.blend'))
print('Saved source scene and ONE unimported Sword OBJ pilot.')
