"""Blender source pack for the authenticated Studio importer; no runtime code."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
ROOT=Path('/Users/pelicannurse/Documents/RobloxCode/rpg-game-1/assets/eldoria')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system='NONE'
materials={};manifest=[]
for ai,asset in enumerate(sorted((ROOT/'refined/transfer').iterdir())):
 if not asset.is_dir() or not (asset/'index.json').exists():continue
 groups={}
 for filename in json.loads((asset/'index.json').read_text()):
  d=json.loads((asset/filename).read_text());g=groups.setdefault(d['material'],{'v':[],'n':[],'f':[],'color':d['color']});off=len(g['v'])
  g['v'] += [[p[k]+d['center'][k] for k in range(3)] for p in d['v']];g['n']+=d['n'];g['f'] += [[i+off for i in f] for f in d['f']]
 parent=bpy.data.objects.new(asset.name,None);bpy.context.collection.objects.link(parent);parent.location=((ai%6)*45,(ai//6)*45,0)
 for name,g in groups.items():
  if name not in materials:
   mat=bpy.data.materials.new(name);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');rgba=tuple(c/255 for c in g['color'])+(1,);bs.inputs['Base Color'].default_value=rgba;mat.diffuse_color=rgba
   bs.inputs['Metallic'].default_value=.85 if name in ['Moonsteel','GoldEdge','AntiqueGold','StormMetal'] else 0;bs.inputs['Roughness'].default_value=.32 if name=='Moonsteel' else .6
   texture=ROOT/'refined/textures'/f'{name}_Color.png'
   if texture.exists():
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(texture));mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
   normal_file=ROOT/'refined/textures'/f'{name}_Normal.png'
   if normal_file.exists():
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(normal_file));tex.image.colorspace_settings.name='Non-Color';normal_node=mat.node_tree.nodes.new('ShaderNodeNormalMap');mat.node_tree.links.new(tex.outputs['Color'],normal_node.inputs['Color']);mat.node_tree.links.new(normal_node.outputs['Normal'],bs.inputs['Normal'])
   rough_file=ROOT/'refined/textures'/f'{name}_Roughness.png'
   if rough_file.exists():
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(rough_file));tex.image.colorspace_settings.name='Non-Color';mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Roughness'])
   materials[name]=mat
  mesh=bpy.data.meshes.new(asset.name+'__'+name);mesh.from_pydata([(p[0],-p[2],p[1]) for p in g['v']],[],g['f']);mesh.update();mesh.normals_split_custom_set_from_vertices([(p[0],-p[2],p[1]) for p in g['n']]);uv=mesh.uv_layers.new(name='UVMap')
  for poly in mesh.polygons:
   poly.use_smooth=True;a,b,c=[Vector(g['v'][i]) for i in poly.vertices];normal=(b-a).cross(c-a);ax,ay,az=abs(normal.x),abs(normal.y),abs(normal.z)
   for li in poly.loop_indices:
    p=g['v'][mesh.loops[li].vertex_index];u,v=(p[0],p[2]) if ay>=ax and ay>=az else (p[2],p[1]) if ax>=az else (p[0],p[1]);uv.data[li].uv=(u*.2,v*.2)
  obj=bpy.data.objects.new(asset.name+'__'+name,mesh);bpy.context.collection.objects.link(obj);obj.parent=parent;obj.data.materials.append(materials[name]);manifest.append({'key':obj.name,'asset':asset.name,'material':name,'triangles':len(g['f'])})
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'import-ready/Eldoria-import-library.blend'))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.fbx(filepath=str(ROOT/'import-ready/Eldoria-import-library.fbx'),use_selection=True,object_types={'MESH','EMPTY'},bake_anim=False,apply_scale_options='FBX_SCALE_UNITS',axis_forward='Z',axis_up='Y',path_mode='COPY',embed_textures=True)
(ROOT/'import-ready/manifest.json').write_text(json.dumps(manifest,indent=2))
print('IMPORT PACK',len(manifest),'meshes',sum(x['triangles'] for x in manifest),'triangles',flush=True)
