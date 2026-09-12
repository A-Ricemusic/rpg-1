import os
source=open(os.path.join(os.path.dirname(__file__),'blender_art.py')).read()
exec(source.split('# Aurelian')[0])
texture_dir=os.path.join(ROOT,'textures');os.makedirs(texture_dir,exist_ok=True)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True
bpy.ops.mesh.primitive_plane_add(size=4);plane=bpy.context.object
for name in ['Sandstone','Bark','Basalt','Mesa']:
 m=MAT[name];plane.data.materials.clear();plane.data.materials.append(m);nodes=m.node_tree.nodes;links=m.node_tree.links;bs=nodes.get('Principled BSDF')
 tex=nodes.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=5;tex.inputs['Detail'].default_value=5;tex.inputs['Roughness'].default_value=.8
 ramp=nodes.new('ShaderNodeValToRGB');base=m.diffuse_color[:3]
 ramp.color_ramp.elements[0].position=.1;ramp.color_ramp.elements[0].color=(*[c*.5 for c in base],1)
 ramp.color_ramp.elements[1].position=.9;ramp.color_ramp.elements[1].color=(*[min(c*1.5,1) for c in base],1)
 links.new(tex.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],bs.inputs['Base Color'])
 if name=='Bark':
  coord=nodes.new('ShaderNodeTexCoord');stretch=nodes.new('ShaderNodeVectorMath');stretch.operation='MULTIPLY';stretch.inputs[1].default_value=(8,.5,1);links.new(coord.outputs['UV'],stretch.inputs[0])
  for node in nodes:
   if node.type=='TEX_NOISE':links.new(stretch.outputs[0],node.inputs['Vector'])
 for kind in ['Color','Normal','Roughness']:
  image=bpy.data.images.new(name+'_'+kind,width=512,height=512,alpha=False)
  if kind!='Color':image.colorspace_settings.name='Non-Color'
  node=nodes.new('ShaderNodeTexImage');node.image=image;nodes.active=node
  bpy.ops.object.select_all(action='DESELECT');plane.select_set(True);bpy.context.view_layer.objects.active=plane
  bpy.ops.object.bake(type={'Color':'DIFFUSE','Normal':'NORMAL','Roughness':'ROUGHNESS'}[kind],margin=8)
  image.filepath_raw=os.path.join(texture_dir,name+'_'+kind+'.png');image.file_format='PNG';image.save();nodes.remove(node)
  print('Baked',name,kind,flush=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Surface-bakes.blend'))
