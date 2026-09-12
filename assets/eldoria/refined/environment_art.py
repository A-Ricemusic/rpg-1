"""Detailed Blender scenery, equipment and articulated character art for Eldoria."""
source=open(os.path.join(os.path.dirname(__file__),'blender_art.py')).read() if False else None
import os
source=open(os.path.join(os.path.dirname(__file__),'blender_art.py')).read()
exec(source.split('# Aurelian')[0])
exec(source[source.index('def export_collection'):source.index('# Convert curves')])
from mathutils import noise
# Keep curved forms smooth without spending triangles on hidden surfaces.
original_tube=tube
def tube(name,points,radius,material,res=2):
 o=original_tube(name,points,radius,material,res);o.data.resolution_u=4;return o
assets=[]
def begin(name):
 global C
 C=collection(name);assets.append(name)
def rock(name,loc,scale,material,seed=1,sub=3):
 o=ico(name,loc,scale,material,sub)
 for v in o.data.vertices:
  q=v.co;fac=1+.20*noise.noise_vector(q*.8+Vector((seed,3,7)))[0]+.08*math.sin(q.z*4);v.co*=fac
 for p in o.data.polygons:p.use_smooth=True
 return o
def column(x,y,h=10):
 cube('Foundation',(x,y,.45),(3.8,3.8,.9),'Sandstone',.12)
 cube('Stylobate',(x,y,1),(3.1,3.1,.35),'StoneEdge',.09)
 verts=[];N=32
 for z,r in [(1.2,1.1),(1.5,1),(h-.9,.85),(h-.6,.97)]:
  for j in range(N):a=j*2*math.pi/N;rr=r*(1+.065*math.cos(a*16));verts.append((x+rr*math.cos(a),y+rr*math.sin(a),z))
 faces=[]
 for k in range(3):
  for j in range(N):faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
 mesh('Fluted limestone',verts,faces,'Sandstone',True)
 for z,r in [(1.3,1.08),(h-1,1.04),(h-.55,1.1)]:ring('Carved moulding',(x,y,z),r,.12,'StoneEdge',segments=32)
 cube('Capital',(x,y,h),(3,3,.7),'StoneEdge',.15)
def arch(radius=7,zbase=9,material='Sandstone'):
 for j in range(19):
  a=j*math.pi/19+.008;b=(j+1)*math.pi/19-.008;verts=[]
  for y in [-.85,.85]:
   for r in [radius-1,radius+1]:
    for t in [a,(a+b)/2,b]:verts.append((r*math.cos(t),y,zbase+r*math.sin(t)))
  faces=[(0,1,4,3),(1,2,5,4),(6,9,10,7),(7,10,11,8),(0,6,7,1),(1,7,8,2),(3,4,10,9),(4,5,11,10),(0,3,9,6),(2,8,11,5)]
  o=mesh('Weathered voussoir',verts,faces,material);m=o.modifiers.new('Worn arrises','BEVEL');m.width=.06;m.segments=2
begin('MoonGate')
column(-7,0,9);column(7,0,9);arch()
for s in [-1,1]:
 tube('Entwined root',[(s*8,-.9,0,1.6),(s*7.5,-1,3,1),(s*6.4,-1.05,7,.8),(s*6.8,-1.05,11,.5),(s*4.8,-1,14,.1)],.25,'Bark')
 for j in range(6):
  z=2+j*1.9;rock('Moss cushion',(s*(7+.4*math.sin(j)),-1,z),(.55,.20,.34),'Moss',j,1)
 ring('Lunar seal',(s*7,-1.1,6),.48,.065,'AntiqueGold',(math.pi/2,0,0),24)
# Floating-looking seal is physically held by sculpted branches.
ring('Moon crest',(0,0,17),1.05,.14,'AntiqueGold',(math.pi/2,0,0),40)
ico('Crest gem',(0,-.12,17),(.35,.2,.7),'Moonstone')
for s in [-1,1]:tube('Crest tendril',[(s*2,0,15.2),(s*1.4,0,16),(s*.5,0,16.2)],.14,'AntiqueGold')
for j in range(12):
 a=j*math.pi/11;tube('Relief rays',[(8.05*math.cos(a),-.9,9+8.05*math.sin(a)),(8.35*math.cos(a),-.9,9+8.35*math.sin(a))],.05,'GoldEdge',1)
begin('ElderOak')
tube('Ancient twisting bole',[(0,0,0,1.4),(.3,0,4,1),(-.5,.4,8,.8),(.6,.8,13,.52),(0,1,18,.18)],1.25,'Bark',3)
for j in range(9):
 a=j*math.tau/9;tube('Buttress roots',[(0,0,3,1),(math.cos(a)*2,math.sin(a)*2,.9,.8),(math.cos(a)*4,math.sin(a)*4,.15,.12)],.6,'Bark')
for j in range(11):
 a=j*2.399;z=8+j%4*1.8;r=4+j%3
 tube('Sweeping bough',[(0,0,z,1),(math.cos(a)*r*.5,math.sin(a)*r*.5,z+2,.65),(math.cos(a)*r,math.sin(a)*r,z+4,.2)],.47,'Bark')
# Individual curved leaves create a broken, organic canopy silhouette.
verts=[[],[]];faces=[[],[]]
for j in range(2000):
 a=random.random()*math.tau;r=math.sqrt(random.random())*8;x=math.cos(a)*r;y=math.sin(a)*r;z=18-(r/8)**2*4+random.uniform(-2.3,2.3)
 angle=random.random()*math.tau;length=random.uniform(.32,.78);width=length*.38;idx=j%2;v=verts[idx];base=len(v);tilt=random.uniform(-.8,.8)
 for k in range(8):
  a=k*math.tau/8;u=math.cos(a)*length;w=math.sin(a)*width*(.85+.15*math.cos(a));h=u*tilt-.06*abs(math.cos(a));v.append((x+u*math.cos(angle)-w*math.sin(angle),y+u*math.sin(angle)+w*math.cos(angle),z+h))
 v.append((x,y,z+.10));faces[idx].extend([(base+k,base+(k+1)%8,base+8) for k in range(8)])
for i in range(2):mesh('Leaf canopy',verts[i],faces[i],'LeafDark' if i==0 else 'LeafLight',True)
begin('FernCluster')
for j in range(9):
 a=j*math.tau/9;length=1.5+j%3*.3
 tube('Fern rachis',[(0,0,0),(math.cos(a)*length*.5,math.sin(a)*length*.5,1.3),(math.cos(a)*length,math.sin(a)*length,.7)],.024,'LeafLight',1)
 for k in range(1,8):
  t=k/8;x=math.cos(a)*length*t;y=math.sin(a)*length*t;z=math.sin(t*math.pi)*1.1+.3;w=.36*(1-t)+.08
  for s in [-1,1]:mesh('Pinna',[(x,y,z),(x+math.cos(a+s*1.1)*w,y+math.sin(a+s*1.1)*w,z+.1),(x+math.cos(a)*.2,y+math.sin(a)*.2,z+.06)],[(0,1,2)],'LeafLight' if k%2 else 'LeafDark',True)
begin('WayShrine')
column(0,0,5)
uv('Offering basin',(0,0,5.5),(1.65,1.65,.48),'AntiqueGold',24,8)
ring('Basin lip',(0,0,5.8),1.4,.08,'GoldEdge',segments=32)
ico('Floating sacred crystal',(0,0,7),(.48,.48,1.15),'Moonstone')
for j in range(4):
 a=j*math.tau/4;tube('Crystal cradle',[(math.cos(a)*1,math.sin(a)*1,5.6),(math.cos(a)*.8,math.sin(a)*.8,6.4),(math.cos(a)*.45,math.sin(a)*.45,6.8)],.09,'AntiqueGold')
begin('RuinedColumn');column(0,0,10)
# Irregular multi-lobed scenery rocks, rather than stretched cubes.
for name,material in [('VolcanicCrag','Basalt'),('GlacialCrag','Glacier'),('MesaCrag','Mesa'),('UnderworldCrag','Obsidian')]:
 begin(name)
 for j in range(4):rock('Eroded formation',(j%2*3-1.5,j//2*2,3+j%3),(3,2.8,4+j%3*1.2),material,j+9,4)
 if name=='VolcanicCrag':
  for j in range(4):tube('Magma seam',[(-2+j*1.3,-2.3,.4),(-2.4+j*1.3,-2.6,2),(-1.6+j*1.3,-2.1,4),(-2+j*1.3,-1.6,6)],.065,'Lava',1)
 if name=='GlacialCrag':
  for j in range(3):rock('Snow mantle',(j-1,.2,6+j%2),(2.6,2.2,.8),'Snow',j,3)
 if name=='UnderworldCrag':
  for j in range(3):ico('Amethyst shard',(-1+j,0,5+j%2),(.3,.45,2),'Soul',1)
begin('StormObelisk')
for j in range(3):cube('Octagonal footing',(0,0,j*.5),(4-j*.6,4-j*.6,.5),'StormMetal',.16,rot=(0,0,j*.14))
for s in [-1,1]:tube('Swept conductor',[(s*1,0,1,1),(s*.6,.2,4,.8),(s*1.2,0,7,.65),(s*.25,0,9,.2)],.35,'StormMetal')
for z in [3,5,7]:ring('Conductive ring',(0,0,z),.85,.08,'AntiqueGold',segments=32)
ico('Stormglass heart',(0,0,8),(.6,.6,1.3),'Glacier')
begin('MerchantPavilion')
for x in [-4,4]:
 for y in [-2,2]:tube('Turned timber post',[(x,y,0),(x,y,5.8)],.16,'Bark');uv('Finial',(x,y,6.1),(.25,.25,.35),'AntiqueGold',12,6)
for y in [-2,2]:tube('Ridge pole',[(-4.5,y,5.6),(0,y,6.4),(4.5,y,5.6)],.13,'Bark')
verts=[];faces=[]
for j in range(9):
 for i in range(17):x=-4.8+i*.6;y=-2.7+j*.675;verts.append((x,y,6.5-.036*x*x-.16*math.cos(y*2)))
for j in range(8):
 for i in range(16):k=j*17+i;faces.append((k,k+1,k+18,k+17))
mesh('Draped canvas',verts,faces,'Leather',True)
for j in [-1,1]:tube('Canopy gilt piping',[(-4.8,j*2.7,5.64),(0,j*2.7,6.4),(4.8,j*2.7,5.64)],.06,'AntiqueGold')
for j in range(6):cube('Counter plank',(-3.75+j*1.5,0,2.7),(1.45,3.5,.25),'Bark',.06)
for x in [-3.5,3.5]:cube('Counter trestle',(x,0,1.3),(.4,3,2.6),'Bark',.08)
# Hero equipment companions.
begin('Trident')
tube('Ashwood shaft',[(0,0,-1.6),(0,0,3.6)],.105,'Bark')
for z in [-1.5,-.8,0,.8,3.4]:ring('Shaft binding',(0,0,z),.12,.03,'AntiqueGold',segments=24)
for s in [-1,0,1]:
 x=s*.75;tube('Forged ocean prong',[(0,0,3.3,.9),(x,0,3.8,.75),(x,0,4.8,.5),(x+s*.12,0,5.65+(s==0)*.4,.015)],.16,'Moonsteel')
 if s:tube('Spiral ornament',[(s*.1,-.1,3.6),(s*.5,-.1,3.75),(s*.7,-.1,4.05)],.035,'GoldEdge')
ico('Tidal core',(0,-.13,3.65),(.2,.12,.34),'Moonstone')
begin('Bow')
for s in [-1,1]:
 tube('Recurved yew limb',[(0,0,0,1),(.42,0,s*.8,.85),(.55,0,s*1.6,.6),(.16,0,s*2.4,.4),(.3,0,s*2.8,.12)],.12,'Bark')
 tube('Gilded limb inlay',[(.08,-.08,0),(.49,-.08,s*.8),(.6,-.05,s*1.6),(.21,-.04,s*2.4)],.026,'AntiqueGold')
tube('Bow string',[(.3,0,-2.8),(0,0,0),(.3,0,2.8)],.013,'Ivory',1)
uv('Wrapped bow grip',(0,0,0),(.14,.13,.38),'Leather')
begin('Arrow');tube('Arrow shaft',[(0,0,-1.4),(0,0,1.3)],.035,'Bark',1)
mesh('Broadhead',[(-.16,0,1.2),(.16,0,1.2),(0,-.045,1.8),(0,.045,1.8)],[(0,1,2),(1,0,3),(0,2,3),(1,3,2)],'Moonsteel')
for j in range(3):
 a=j*math.tau/3;mesh('Feather fletching',[(0,0,-1.4),(math.cos(a)*.2,math.sin(a)*.2,-1.25),(math.cos(a)*.2,math.sin(a)*.2,-.7),(0,0,-.8)],[(0,1,2,3)],'Ivory')
begin('HealingPotion')
uv('Rounded flask',(0,0,.45),(.34,.34,.42),'Moonstone',24,12);tube('Bottle neck',[(0,0,.65),(0,0,1)],.12,'Moonsteel')
ring('Bottle collar',(0,0,.87),.14,.035,'AntiqueGold',segments=24);cube('Cork',(0,0,1.03),(.23,.23,.15),'Bark',.05)
for s in [-1,1]:tube('Filigree cage',[(0,0,.05),(s*.32,0,.35),(s*.27,0,.65),(0,0,.8)],.024,'AntiqueGold')
begin('Crystal')
for j in range(5):
 o=ico('Quartz prism',((j%3-1)*.32,j//3*.3,.7+j%2*.2),(.22,.22,.8+j%2*.2),'Moonstone',1);o.rotation_euler[1]=(j-2)*.1
begin('Ore');rock('Ore matrix',(0,0,.45),(.8,.65,.6),'Basalt',4)
for j in range(4):ico('Gold inclusion',(-.45+j*.3,-.4,.6),(.15,.12,.2),'AntiqueGold',1)
begin('Wood');tube('Split branch',[(0,0,0),(0,0,1.5)],.35,'Bark');ring('Endgrain',(0,0,1.5),.21,.04,'Ivory',segments=20)
begin('Coin');ring('Coin rim',(0,0,0),.39,.035,'GoldEdge',segments=32);uv('Coin face',(0,0,0),(.38,.38,.05),'AntiqueGold',24,6);tube('Stamped sigil',[(-.1,-.15,.06),(.13,0,.06),(-.1,.15,.06)],.022,'GoldEdge',1)
begin('Herb')
for j in range(7):
 a=j*math.tau/7;mesh('Medicinal leaf',[(0,0,0),(.45*math.cos(a+.4),.45*math.sin(a+.4),.35),(.65*math.cos(a),.65*math.sin(a),.7),(.45*math.cos(a-.4),.45*math.sin(a-.4),.35)],[(0,1,2,3)],'LeafLight',True)
# Armor parts align to each R6 limb center and move with existing Motor6D joints.
begin('ArmorTorso')
uv('Sculpted cuirass',(0,0,.12),(1.02,.54,.91),'StormMetal',24,12)
for s in [-1,1]:
 tube('Chest scroll',[(0,-.52,.65),(s*.6,-.50,.6),(s*.82,-.42,.1),(s*.45,-.5,-.5)],.035,'AntiqueGold')
for j in range(3):cube('Overlapping fauld',(0,-.06,-.60-j*.16),(1.9-j*.06,1,.2),'StormMetal',.08)
ico('Breast jewel',(0,-.56,.35),(.18,.08,.26),'Moonstone')
begin('ArmorArm')
uv('Gambeson sleeve',(0,0,.18),(.36,.38,.65),'Leather',16,8)
uv('Pauldrons',(0,0,.7),(.6,.57,.43),'StormMetal',20,10)
uv('Bracer',(0,0,-.45),(.44,.46,.6),'StormMetal',20,10)
for z in [-.8,-.1,.85]:ring('Armor rim',(0,0,z),.44,.035,'AntiqueGold',segments=24)
uv('Glove',(0,0,-.85),(.39,.4,.25),'Leather',16,8)
begin('ArmorLeg')
uv('Greave',(0,.03,.04),(.44,.43,.9),'StormMetal',20,10)
uv('Sabatons',(0,-.16,-.77),(.46,.7,.25),'StormMetal',20,8)
tube('Greave ridge',[(0,-.43,-.5),(0,-.45,.2),(0,-.40,.65)],.035,'AntiqueGold')
begin('ArmorHead')
uv('Helm dome',(0,0,0),(.68,.62,.66),'StormMetal',24,12)
for s in [-1,1]:cube('Cheek plate',(s*.43,-.36,-.25),(.22,.5,.58),'StormMetal',.10,rot=(0,s*.12,0))
cube('Visor slit',(0,-.615,.02),(1.03,.045,.09),'Moonstone',.02)
tube('Brow crest',[(-.57,-.45,.25),(0,-.64,.37),(.57,-.45,.25)],.065,'AntiqueGold')
for s in [-1,1]:tube('Swept helm wings',[(s*.55,0,.2,1),(s*.82,.08,.75,.6),(s*.65,.25,1.3,.03)],.15,'AntiqueGold')
begin('CivilianHead')
uv('Face',(0,-.04,-.02),(.55,.50,.6),'Ivory',24,12)
uv('Nose',(0,-.5,-.02),(.10,.13,.17),'Ivory',12,8)
for s in [-1,1]:
 uv('Eye',(s*.22,-.49,.1),(.09,.045,.05),'Obsidian',12,6);tube('Eyebrow',[(s*.1,-.5,.23),(s*.25,-.48,.26),(s*.36,-.40,.2)],.035,'Bark',1)
tube('Mouth',[(-.12,-.48,-.25),(0,-.52,-.27),(.12,-.48,-.25)],.019,'Bark',1)
uv('Hood',(0,.12,.3),(.65,.53,.51),'Leather',20,10)
for s in [-1,1]:tube('Hood edge',[(s*.45,-.24,-.4),(s*.59,-.30,.1),(s*.43,-.35,.59),(0,-.37,.72)],.095,'Leather')
# Five identifiable boss crowns; geometry is separate and welds to the Head.
for name,material in [('BriarCrown','Bark'),('PyreCrown','Lava'),('FrostCrown','Glacier'),('StormCrown','AntiqueGold'),('VoidCrown','Soul')]:
 begin(name)
 ring('Crown circlet',(0,0,.45),.67,.07,material,segments=24)
 if name=='BriarCrown':
  for sign in [-1,1]:
   tube('Stag antler',[(sign*.5,0,.4,1),(sign*1.1,.1,1.2,.8),(sign*1.5,.2,2,.5),(sign*1.2,.3,2.6,.04)],.15,'Bark')
   for j in range(3):tube('Antler tine',[(sign*(.8+j*.2),.1,1+j*.4,.8),(sign*(1.45+j*.3),0,1.3+j*.5,.02)],.09,'Bark')
 elif name=='PyreCrown':
  for sign in [-1,1]:
   tube('Tyrant ram horn',[(sign*.5,0,.4,1),(sign*1.1,.25,.95,.9),(sign*1.3,-.1,.6,.65),(sign*1,-.5,.25,.4),(sign*.8,-.35,.5,.02)],.22,'Basalt')
  for j in range(3):tube('Flame crown',[(j*.32-.32,0,.6,1),(j*.4-.4,.1,1.4,.5),(j*.25-.25,.05,2-j%2*.5,.01)],.12,'Lava')
 elif name=='FrostCrown':
  for j in range(7):
   angle=(j-3)*.18;o=ico('Royal ice blade',((j-3)*.26,.25,1.1+(.6-abs(j-3)*.12)),(.16,.25,.8),'Glacier',1);o.rotation_euler.y=angle
 elif name=='StormCrown':
  ring('Solar halo',(0,.35,1.05),1.15,.065,'AntiqueGold',(math.pi/2,0,0),40)
  for sign in [-1,1]:
   for j in range(4):tube('Crown wing',[(sign*.5,0,.5+j*.1,1),(sign*(1+j*.14),.1,.85+j*.2,.6),(sign*(1.45+j*.1),.2,1.5+j*.2,.02)],.06,'GoldEdge')
 else:
  for j in range(7):
   a=j*math.tau/7;points=[(math.cos(a+t)*1.05,.2,1+math.sin(a+t)*1.05) for t in [0,.2,.4,.6]];tube('Broken void halo',points,.09,'Soul')
  for sign in [-1,1]:tube('Void horn',[(sign*.5,0,.45,1),(sign*.6,-.1,1.3,.7),(sign*.35,0,2.1,.01)],.11,'Obsidian')
# Save the native curves, bevel modifiers and editable meshes before exporting.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'Eldoria-refined-library.blend'))
for name in assets:export_collection(name)
print('ASSETS:',len(assets),flush=True)
