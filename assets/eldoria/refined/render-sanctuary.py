import bpy, os, math
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__))
# Run with the refined library .blend open. Hide source collections, instance chosen art.
scene=bpy.context.scene
for c in list(scene.collection.children):scene.collection.children.unlink(c)
stage=bpy.data.collections.new('Sanctuary composition');scene.collection.children.link(stage)
def instance(name,pos,scale=1,yaw=0):
 o=bpy.data.objects.new(name+'_placed',None);o.instance_type='COLLECTION';o.instance_collection=bpy.data.collections[name];o.location=pos;o.scale=(scale,)*3;o.rotation_euler.z=yaw;stage.objects.link(o)
instance('MoonGate',(0,0,0))
for pos,s in [((-13,5,0),1.1),((14,8,0),1.25),((-18,22,0),1.4),((18,24,0),1.5)]:instance('ElderOak',pos,s)
for x in [-8,8]:
 for y in [12,22]:instance('RuinedColumn',(x,y,0),1.1)
instance('WayShrine',(0,20,0),1.5)
for j in range(18):instance('FernCluster',((-1 if j%2 else 1)*(5+j%4*2),-4+(j//2)*3,0),1+j%3*.3,j*1.7)
bpy.ops.mesh.primitive_plane_add(size=200);ground=bpy.context.object;ground.data.materials.append(bpy.data.materials['Moss'])
for j in range(16):
 bpy.ops.mesh.primitive_cube_add(size=1,location=((j%2-.5)*2.1,(j//2)*3-5,.08));o=bpy.context.object;o.scale=(2,2.8,.15);o.data.materials.append(bpy.data.materials['Sandstone']);bevel=o.modifiers.new('Stone edges','BEVEL');bevel.width=.05;bevel.segments=2
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.world.color=(.2,.22,.26)
bpy.ops.object.camera_add(location=(29,-37,19));cam=bpy.context.object;cam.rotation_euler=(Vector((0,9,8))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=42;scene.camera=cam
bpy.ops.object.light_add(type='SUN',location=(0,0,40));sun=bpy.context.object;sun.rotation_euler=(.5,-.5,-.6);sun.data.energy=2;sun.data.angle=.10;sun.data.color=(1,.86,.66)
for p in [(-12,-8,18),(8,20,22)]:
 bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.energy=2500;o.data.size=12;o.data.color=(.5,.7,1);o.rotation_euler=(Vector((0,10,8))-o.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=1500;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.filepath=os.path.join(ROOT,'Sanctuary-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Sanctuary-composition.blend'));bpy.ops.render.render(write_still=True)
