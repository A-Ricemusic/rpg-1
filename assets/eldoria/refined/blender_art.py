"""Blender-authored Eldoria environment art. Geometry exported for Studio mesh transfer.
No Roblox runtime scripts. Units are studs. Blender +Z maps to Roblox +Y.
"""
import bpy, math, random, json, os, sys
from mathutils import Vector
random.seed(812)
ROOT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
MAT={}
def mat(name,color,metal=0,rough=.5,noise=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if noise:
  nt=m.node_tree.nodes;tex=nt.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=18;tex.inputs['Detail'].default_value=4
  bump=nt.new('ShaderNodeBump');bump.inputs['Strength'].default_value=noise;bump.inputs['Distance'].default_value=.06;m.node_tree.links.new(tex.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],bs.inputs['Normal'])
 MAT[name]=m;return m
mat('Moonsteel',(.48,.63,.67),.86,.24,.15);mat('AntiqueGold',(.55,.32,.10),.8,.3,.2);mat('GoldEdge',(.85,.63,.25),.78,.25)
mat('Leather',(.055,.105,.08),0,.7,.35);mat('Obsidian',(.022,.032,.04),.6,.2)
mat('Moonstone',(.12,.65,.49),.45,.2);mat('Ivory',(.75,.71,.56),.05,.55,.1)
mat('Sandstone',(.34,.40,.36),0,.83,.7);mat('StoneEdge',(.5,.55,.45),0,.8,.6);mat('Moss',(.10,.19,.075),0,.95,.7)
mat('Bark',(.13,.075,.037),0,.95,.65);mat('LeafDark',(.035,.12,.065),0,.9);mat('LeafLight',(.13,.28,.11),0,.85)
mat('Basalt',(.07,.06,.065),.05,.88,.8);mat('Lava',(.95,.15,.025),.05,.5)
mat('Glacier',(.22,.53,.67),.25,.24);mat('Snow',(.81,.88,.91),0,.75,.1)
mat('Mesa',(.37,.20,.105),0,.88,.7);mat('StormMetal',(.14,.2,.3),.7,.3);mat('Soul',(.34,.095,.52),.3,.25)
for k in ['Moonstone','Lava','Soul']:
 bs=MAT[k].node_tree.nodes.get('Principled BSDF');bs.inputs['Emission Color'].default_value=MAT[k].diffuse_color;bs.inputs['Emission Strength'].default_value=.65
collections={}
def collection(name):
 c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c);collections[name]=c;return c
C=collection('Sword')
def finish(o,name,material,bevel=0,smooth=True):
 o.name=name
 for c in list(o.users_collection):c.objects.unlink(o)
 C.objects.link(o);o.data.materials.append(MAT[material])
 if bevel:
  m=o.modifiers.new('Hand finished edges','BEVEL');m.width=bevel;m.segments=2
 if smooth:
  for p in o.data.polygons:p.use_smooth=True
 return o
def cube(name,loc,dim,material,bevel=.03,rot=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if rot:o.rotation_euler=rot
 return finish(o,name,material,bevel,False)
def uv(name,loc,scale,material,segments=20,rings=10):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material)
def ico(name,loc,scale,material,sub=2):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material,smooth=False)
def tube(name,points,radius,material,res=3):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=8;cu.bevel_depth=radius;cu.bevel_resolution=res
 sp=cu.splines.new('BEZIER');sp.use_smooth=True;sp.bezier_points.add(len(points)-1)
 for b,p in zip(sp.bezier_points,points):b.co=p[:3];b.radius=p[3] if len(p)>3 else 1;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,cu);C.objects.link(o);cu.materials.append(MAT[material]);return o
def ring(name,loc,major,minor,material,rot=(0,0,0),segments=40):
 bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=segments,minor_segments=8,location=loc,rotation=rot);return finish(bpy.context.object,name,material)
def mesh(name,verts,faces,material,smooth=False):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);C.objects.link(o);me.materials.append(MAT[material]);
 for p in me.polygons:p.use_smooth=smooth
 return o
# Aurelian Moonblade: tapered diamond-section blade, raised fuller and organic guard.
verts=[]
for z,w,d in [(0.65,.26,.085),(1,.34,.085),(3.5,.23,.055),(4.2,.12,.035),(4.65,.001,.001)]:verts += [(-w,0,z),(0,-d,z),(w,0,z),(0,d,z)]
faces=[]
for j in range(4):
 for i in range(4):faces.append((j*4+i,j*4+(i+1)%4,(j+1)*4+(i+1)%4,(j+1)*4+i))
faces += [(3,2,1,0),(16,17,18,19)];mesh('Forged diamond blade',verts,faces,'Moonsteel')
for y in [-.09,.09]:
 tube('Inlaid gold fuller',[(0,y,.86),(0,y,1.3),(0,y,3.4),(0,y*.55,4.12)],.022,'GoldEdge',2)
 for j in range(7):
  z=1.28+j*.32;tube('Runic engraving',[(.035,y,z),(.13,y,z+.065),(.04,y,z+.14)],.012,'GoldEdge',1)
for s in [-1,1]:
 tube('Leafwing quillon',[(0,0,.65,.9),(s*.48,0,.56,1),(s*.88,0,.78,.72),(s*1.02,0,1.08,.12)],.12,'AntiqueGold')
 tube('Guard raised rim',[(s*.12,-.10,.7),(s*.47,-.09,.65),(s*.78,-.075,.8),(s*.99,0,1.05)],.023,'GoldEdge',2)
 for j in range(4):
  x=s*(.28+j*.14);tube('Feather filigree',[(x,-.10,.67),(x+s*.07,-.11,.8),(x+s*.18,-.06,.87)],.022,'GoldEdge',2)
uv('Guard socket',(0,0,.62),(.22,.16,.28),'AntiqueGold');ico('Emerald heart',(0,-.16,.67),(.13,.065,.18),'Moonstone')
# Elliptical leather grip with spiral binding.
uv('Leather grip',(0,0,0),(.145,.115,.57),'Leather')
for j in range(10):
 z=-.5+j*.105;tube('Leather wrap',[(.15*math.cos(a),.12*math.sin(a),z+a/(2*math.pi)*.1) for a in [i*math.pi/5 for i in range(11)]],.018,'AntiqueGold',1)
for z in [-.52,.5]:ring('Grip ferrule',(0,0,z),.13,.035,'GoldEdge',segments=24)
ring('Crescent pommel',(0,0,-.77),.21,.045,'AntiqueGold',(math.pi/2,0,0),32);ico('Pommel stone',(0,0,-.78),(.105,.08,.14),'Moonstone')
# Save/export evaluated geometry, grouped by material into moderately sized chunks.
def export_collection(name):
 col=collections[name];deps=bpy.context.evaluated_depsgraph_get();groups={}
 for o in col.objects:
  if o.type not in {'MESH','CURVE'}:continue
  ev=o.evaluated_get(deps);me=ev.to_mesh();me.calc_loop_triangles()
  for tri in me.loop_triangles:
   material=me.materials[tri.material_index].name if len(me.materials) else 'Sandstone';g=groups.setdefault(material,{'v':[],'n':[],'f':[]})
   face=[]
   for li in tri.loops:
    l=me.loops[li];p=o.matrix_world@me.vertices[l.vertex_index].co;n=o.matrix_world.to_3x3()@me.corner_normals[li].vector;n.normalize()
    face.append(len(g['v']));g['v'].append([round(p.x,5),round(p.z,5),round(-p.y,5)]);g['n'].append([round(n.x,5),round(n.z,5),round(-n.y,5)])
   g['f'].append(face)
  ev.to_mesh_clear()
 os.makedirs(os.path.join(ROOT,'meshes',name),exist_ok=True);manifest=[]
 for material,g in groups.items():
  for start in range(0,len(g['f']),700):
   fs=g['f'][start:start+700];a=start*3;b=(start+len(fs))*3
   d={'name':name,'material':material,'color':[round(c*255) for c in MAT[material].diffuse_color[:3]],'v':g['v'][a:b],'n':g['n'][a:b],'f':[[i-a for i in f] for f in fs]}
   filename=f'{material}-{start//700}.json';json.dump(d,open(os.path.join(ROOT,'meshes',name,filename),'w'),separators=(',',':'));manifest.append(filename)
 json.dump(manifest,open(os.path.join(ROOT,'meshes',name,'index.json'),'w'))
 bpy.ops.object.select_all(action='DESELECT')
 baked=[]
 for source_object in list(col.objects):
  if source_object.type not in {'MESH','CURVE'}:continue
  evaluated=source_object.evaluated_get(deps)
  baked_mesh=bpy.data.meshes.new_from_object(evaluated,depsgraph=deps)
  obj=bpy.data.objects.new(source_object.name+'_export',baked_mesh);bpy.context.scene.collection.objects.link(obj);obj.matrix_world=source_object.matrix_world;obj.select_set(True);baked.append(obj)
 bpy.ops.export_scene.fbx(filepath=os.path.join(ROOT,name+'.fbx'),use_selection=True,object_types={'MESH'},bake_anim=False,axis_forward='-Z',axis_up='Y')
 for obj in baked:
  geometry=obj.data;bpy.data.objects.remove(obj,do_unlink=True);bpy.data.meshes.remove(geometry)
 print(name,':',sum(len(g['f']) for g in groups.values()),'triangles;',len(manifest),'chunks',flush=True)
# Convert curves in exported FBX by duplicate-free conversion; the .blend keeps curves.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Moonblade-pilot.blend'))
export_collection('Sword')
# Beauty render for review.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48
scene.world.color=(.12,.12,.12)
back=collection('Presentation');C=back
cube('Backdrop',(0,1,2),(200,.1,200),'Obsidian',0)
bpy.ops.object.camera_add(location=(6,-10,5));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.8))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=7.5;scene.camera=camera
for pos,power,size,color in [((2,-5,7),1100,5,(.65,.82,1)),((-4,-2,2),850,4,(1,.69,.32)),((1,2,5),1300,3,(.4,1,.76))]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,2))-o.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=1200;scene.render.resolution_y=1200;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ROOT,'Moonblade-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Moonblade-pilot.blend'))
bpy.ops.render.render(write_still=True)
