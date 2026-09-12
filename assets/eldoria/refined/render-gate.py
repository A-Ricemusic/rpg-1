import os
script=os.path.join(os.path.dirname(__file__),'environment_art.py')
exec(open(script).read().split("begin('ElderOak')")[0])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'MoonGate-preview.blend'))
C=collection('Presentation')
cube('Ground',(0,0,-.25),(80,80,.5),'Basalt',.1)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=40;scene.world.color=(.13,.13,.13)
bpy.ops.object.camera_add(location=(24,-33,22));o=bpy.context.object;o.rotation_euler=(Vector((0,0,8))-o.location).to_track_quat('-Z','Y').to_euler();o.data.type='ORTHO';o.data.ortho_scale=28;scene.camera=o
for pos,power,size,color in [((3,-10,26),3600,14,(1,.84,.55)),((-12,-5,13),2200,10,(.35,.65,1)),((6,8,22),4400,8,(.4,1,.67))]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,9))-o.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=1300;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.filepath=os.path.join(ROOT,'MoonGate-preview.png')
bpy.ops.render.render(write_still=True)
