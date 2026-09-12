/** Offline, edit-time world expansion. Never sync these payloads through Rojo. */
import { writeFileSync } from "node:fs";
export const common = String.raw`
assert(not game:GetService("RunService"):IsRunning(),"Edit mode required")
local world=assert(workspace:FindFirstChild("EldoriaWorld"))
local assets=assert(game.ReplicatedStorage:FindFirstChild("GameAssets"))
local library=assert(assets:FindFirstChild("RefinedArt"))
local CS=game:GetService("CollectionService")
local regions={
 {name="01_WhisperingWilds",id="Verdant",x=0,z=0,old=0,mat=Enum.Material.Grass,rock="MesaCrag",color=Color3.fromRGB(100,113,80),sites={"Dryad Orchard","Mosswater Abbey","Old Pilgrim Quarry"}},
 {name="04_EmberfallCaldera",id="Ember",x=-1450,z=-1100,old=360,mat=Enum.Material.Basalt,rock="VolcanicCrag",color=Color3.fromRGB(85,71,66),sites={"Cinder Foundry","Ashen Monastery","Obsidian Excavation"}},
 {name="03_FrostveilReach",id="Frost",x=1050,z=-1550,old=720,mat=Enum.Material.Snow,rock="GlacialCrag",color=Color3.fromRGB(176,196,204),sites={"Aurora Observatory","Buried Scriptorium","Blueice Mine"}},
 {name="08_ZephyrMesa",id="Storm",x=1550,z=650,old=1080,mat=Enum.Material.Sandstone,rock="MesaCrag",color=Color3.fromRGB(163,125,87),sites={"Eaglewatch Terrace","Stormglass Cloister","Thunderstone Dig"}},
 {name="10_UmbralHollow",id="Umbral",x=-1150,z=1250,old=1440,mat=Enum.Material.Slate,rock="UnderworldCrag",color=Color3.fromRGB(79,71,92),sites={"Ferryman Rest","Archive of Echoes","Soulstone Hollow"}},
}
local nodes={{-85,0,-64},{-280,0,-70},{-380,0,-220},{-80,0,-340},{110,0,-310},{350,0,-230},{410,0,30},{280,0,290},{20,0,360},{-310,0,160}}
local edges={{1,2},{2,3},{3,4},{4,5},{5,6},{6,7},{7,8},{8,9},{9,10},{10,2},{1,5},{1,9}}
local side={{-380,0,-220},{110,0,-310},{-310,0,160}}
local function vec(a) return Vector3.new(a[1],a[2],a[3]) end
local function folder(parent,name) local f=Instance.new("Folder");f.Name=name;f.Parent=parent;return f end
local function part(parent,name,size,cf,mat,color,collide)
 local p=Instance.new("Part");p.Name=name;p.Size=size;p.CFrame=cf;p.Anchored=true;p.Material=mat;p.Color=color;p.CanCollide=collide~=false;p.TopSurface=Enum.SurfaceType.Smooth;p.BottomSurface=Enum.SurfaceType.Smooth;p:SetAttribute("AuthoredBy","WorldArt");p:SetAttribute("ArtVersion",3);p.Parent=parent;return p
end
local function marker(parent,name,pos,kind,id)
 local p=part(parent,name,Vector3.one,CFrame.new(pos),Enum.Material.SmoothPlastic,Color3.new(1,1,1),false);p.Transparency=1;p.CanQuery=false;p.CanTouch=false;p:SetAttribute("MarkerType",kind);p:SetAttribute("RegionId",id);CS:AddTag(p,"EldoriaExplorationMarker");return p
end
local function mesh(parent,name,source,pos,scale,yaw)
 local m=library[source]:Clone();m.Name=name;m:ScaleTo(scale or 1);m:PivotTo(CFrame.new(pos)*CFrame.Angles(0,math.rad(yaw or 0),0));m.Parent=parent
 for _,p in m:GetDescendants() do if p:IsA("BasePart") then p.Anchored=true;p.CanCollide=false;p.CanQuery=false end end
 m:SetAttribute("ArtVersion",3);return m
end
local function move(o,delta) if o:IsA("BasePart") then o.CFrame+=delta elseif o:IsA("Model") then o:PivotTo(o:GetPivot()+delta) end end
local function route(parent,name,a,b,width,color)
 local mid=(a+b)/2;local p=part(parent,name,Vector3.new(width,1.2,(b-a).Magnitude+2),CFrame.lookAt(mid,b),Enum.Material.Ground,color,true)
 p:SetAttribute("RouteStart",a);p:SetAttribute("RouteEnd",b);p:SetAttribute("RouteWidth",width);CS:AddTag(p,"EldoriaRoute");return p
end
local function distance(x,z,a,b)
 local dx,dz=b[1]-a[1],b[3]-a[3];local t=math.clamp(((x-a[1])*dx+(z-a[3])*dz)/(dx*dx+dz*dz),0,1)
 return math.sqrt((x-a[1]-t*dx)^2+(z-a[3]-t*dz)^2)
end
local function height(x,z,index)
 local d=math.max(math.abs(x),math.abs(z));local edge=math.clamp((576-d)/75,0,1)
 local h=7+22*(.5+.5*math.noise(x*.004,z*.004,index*7))+42*math.max(0,math.noise(x*.009,z*.009,index*11))
 if d>400 then h+=55*math.clamp((d-400)/140,0,1) end
 local clear=math.huge
 for _,e in edges do clear=math.min(clear,distance(x,z,nodes[e[1]],nodes[e[2]])) end
 for _,p in {{-220,0,210},{170,0,-295},{375,0,-170},{265,0,205}} do clear=math.min(clear,math.max(0,math.sqrt((x-p[1])^2+(z-p[3])^2)-42)) end
 -- Broad clearings for the preserved settlement and boss temple.
 clear=math.min(clear,math.max(0,math.sqrt((x+85)^2+(z+64)^2)-95),math.max(0,math.sqrt((x-280)^2+(z-290)^2)-100))
 for _,p in side do clear=math.min(clear,math.max(0,math.sqrt((x-p[1])^2+(z-p[3])^2)-58)) end
 -- Arrival trails cross west/east edges; northern/southern junctions connect the world.
 for _,a in {{{-576,0,0},{-280,0,-70}},{{410,0,30},{576,0,0}},{{-80,0,-576},{-80,0,-340}},{{20,0,360},{20,0,576}}} do clear=math.min(clear,distance(x,z,a[1],a[2])) end
 clear=math.min(clear,distance(x,z,{410,0,30},{455,0,175}),math.max(0,math.sqrt((x-455)^2+(z-187)^2)-30))
 h*=math.clamp((clear-22)/55,0,1)
 local pond=math.sqrt((x-150)^2+(z-100)^2)
 if pond<65 then h=-16+16*math.clamp((pond-43)/22,0,1) end
 return -24+(h+24)*edge
end
`;
export const prepare =
  common +
  String.raw`
assert(not world:GetAttribute("ExpandedWorld"),"Already expanded")
local archive=Instance.new("Model");archive.Name="WorldLayoutArchive_v2";assert(not game.ServerStorage:FindFirstChild(archive.Name));archive.Parent=game.ServerStorage
local backup=world:Clone();backup.Parent=archive
for _,d in backup:GetDescendants() do for _,tag in CS:GetTags(d) do CS:RemoveTag(d,tag) end end
local old=folder(archive,"ReplacedLayoutPieces")
for _,name in {"Connections","LandscapeUnderlay"} do local o=world:FindFirstChild(name);if o then o.Parent=old end end
for i,r in regions do
 local m=world[r.name];m:PivotTo(m:GetPivot()+Vector3.new(r.x-r.old,0,r.z));m:SetAttribute("WorldCenter",Vector3.new(r.x,0,r.z));m:SetAttribute("ExplorationRadius",576);m:SetAttribute("ArtVersion",3)
 local depot=folder(old,r.name)
 for _,o in m:GetChildren() do
  local n=o.Name
  if n=="Landmass" or n=="PilgrimRoad" or n=="SanctumApproach" or n=="CampApproach" or n=="LandscapeDetails" or n=="RefinedLandscape" or n:match("^SacredOak") or n:match("^RoadLantern") or n:match("^Mountain") or n:match("^Snowcap") or n:match("^ObsidianSpire") or n:match("^MesaButte") or n:match("^MesaCap") or n:match("^Cavern") or n=="SoulRiver" or n=="FrozenLake" or n:match("^IceMonolith") or n:match("^LavaFissure") then
   for _,d in o:GetDescendants() do for _,tag in CS:GetTags(d) do CS:RemoveTag(d,tag) end end;for _,tag in CS:GetTags(o) do CS:RemoveTag(o,tag) end;o.Parent=depot
  elseif n:match("^Arena") or n:match("^Boss") or n:match("^Temple") or n=="MemoryAltar" or n:match("^Caldera") or n:match("^Throne") or n:match("^StormPylon") or n:match("^StormBeacon") or n=="SkyDais" then move(o,Vector3.new(215,0,199))
  elseif n=="Entrance" then o.Position=Vector3.new(r.x-480,1,r.z)
  elseif n=="Exit" then o.Position=Vector3.new(r.x+480,1,r.z)
  elseif n:match("^Entry") or n=="EntranceLintel" or n=="RegionSign" then move(o,Vector3.new(-328,0,0)) end
 end
 -- Move existing gameplay resource markers and their art together.
 for _,o in m:GetChildren() do if o:IsA("BasePart") and o:GetAttribute("MarkerType")=="Gathering" then
  local k=tonumber(o.Name:match("_(%d+)$"));if k then local target=Vector3.new(r.x+side[k][1],1,r.z+side[k][3]);local delta=target-o.Position;move(o,delta);for j=0,2 do local v=m:FindFirstChild("Resource_"..(k-1).."_"..j);if v then move(v,delta) end end end
 end end
 local enemy={{-220,0,210},{170,0,-295},{375,0,-170},{265,0,205}}
 for j,p in enemy do local o=m:FindFirstChild("EnemySpawn_0"..j);if o then local target=Vector3.new(r.x+p[1],1,r.z+p[3]);local delta=target-o.Position;move(o,delta);local v=m:FindFirstChild("EnemyArtwork_"..tostring(o:GetAttribute("EnemyId")));if v then move(v,delta) end end end
 marker(m,"CampSpawn",Vector3.new(r.x-85,1,r.z-52),"CampSpawn",r.id)
 if not m:FindFirstChild("BlacksmithLocation") then local p=marker(m,"BlacksmithLocation",Vector3.new(r.x-122,1,r.z-35),"Blacksmith",r.id);CS:AddTag(p,"EldoriaMarker");local npc=assets.Characters.Blacksmith:Clone();npc.Name="Blacksmith";npc:PivotTo(CFrame.new(p.Position-Vector3.yAxis)*CFrame.Angles(0,math.pi,0));npc.Parent=m end
end
world:SetAttribute("ExpandedWorld",true);world:SetAttribute("ArtVersion",3)
return {prepared=true,place=game.Name}
`;
export const terrain =
  common +
  String.raw`
local r=regions[regionIndex];local terr=workspace.Terrain
local x0=r.x-576+(stripIndex-1)*192;local z0=r.z-576
local area=Region3.new(Vector3.new(x0,-48,z0),Vector3.new(x0+192,144,z0+1152)):ExpandToGrid(4)
local lo=area.CFrame.Position-area.Size/2;local nx,ny,nz=area.Size.X/4,area.Size.Y/4,area.Size.Z/4
local materials,occupancies={},{}
for x=1,nx do materials[x]={};occupancies[x]={};for y=1,ny do materials[x][y]={};occupancies[x][y]={} end
 for z=1,nz do local h=height(lo.X+(x-.5)*4-r.x,lo.Z+(z-.5)*4-r.z,regionIndex)
  for y=1,ny do local y0=lo.Y+(y-1)*4;local o=math.clamp((h-y0)/4,0,1);materials[x][y][z]=(y0<h-8) and Enum.Material.Rock or r.mat;occupancies[x][y][z]=o
 if h < -4 and math.sqrt((lo.X+(x-.5)*4-r.x-150)^2+(lo.Z+(z-.5)*4-r.z-100)^2)<65 and y0>=h and y0< -3 then materials[x][y][z]=regionIndex==3 and Enum.Material.Ice or Enum.Material.Water;occupancies[x][y][z]=math.clamp((-3-y0)/4,0,1) end end
 end
end
terr:WriteVoxels(area,4,materials,occupancies)
return {region=r.id,strip=stripIndex}
`;
export const furnish =
  common +
  String.raw`
local r=regions[regionIndex];local m=world[r.name];assert(not m:FindFirstChild("ExpansiveLandscape"))
local f=folder(m,"ExpansiveLandscape");local routes=folder(f,"Routes");local scenery=folder(f,"Scenery");local sites=folder(f,"PlacesOfInterest");local origin=Vector3.new(r.x,0,r.z)
for i,e in edges do route(routes,"LoopTrail_"..i,origin+vec(nodes[e[1]])+Vector3.new(0,.65,0),origin+vec(nodes[e[2]])+Vector3.new(0,.65,0),16,r.color) end
for i,a in {{{-576,0,0},{-280,0,-70}},{{410,0,30},{576,0,0}},{{-80,0,-576},{-80,0,-340}},{{20,0,360},{20,0,576}}} do route(routes,"ArrivalTrail_"..i,origin+vec(a[1])+Vector3.new(0,.65,0),origin+vec(a[2])+Vector3.new(0,.65,0),20,r.color) end
-- Gentle ramps integrate the existing camp and arena floor with the new trails.
for i,p in nodes do marker(f,"TrailJunction_"..i,origin+vec(p)+Vector3.yAxis,"TrailJunction",r.id) end
mesh(scenery,"ArrivalMoonGate","MoonGate",origin+Vector3.new(-478,0,0),1.4,90)
mesh(scenery,"SanctumMoonGate","MoonGate",origin+Vector3.new(280,0,247),1.5,0)
for i,p in side do
 local site=Instance.new("Model");site.Name=r.sites[i]:gsub(" ","");site.Parent=sites;site:SetAttribute("DisplayName",r.sites[i]);site:SetAttribute("RegionId",r.id)
 local at=origin+vec(p);marker(site,"Discovery_"..r.id.."_"..i,at+Vector3.yAxis,"Discovery",r.id)
 if i==1 then
  mesh(site,"WaysidePavilion","MerchantPavilion",at+Vector3.new(-25,0,-24),1.25,25)
  mesh(site,"MemorialShrine","WayShrine",at+Vector3.new(24,0,-23),1.8,0)
 elseif i==2 then
  for j=0,5 do local a=j*math.pi/3;mesh(site,"CloisterColumn_"..j,"RuinedColumn",at+Vector3.new(math.cos(a)*32,0,math.sin(a)*32),1.4,j*60) end
  mesh(site,"AbbeyGate","MoonGate",at+Vector3.new(0,0,42),1.3,0)
 else
  for j=1,6 do local a=j*.8;mesh(site,"QuarryFace_"..j,r.rock,at+Vector3.new(math.cos(a)*43,0,math.sin(a)*43),2.8+j*.12,j*31) end
 end
 -- Additional working gathering markers are discovered by the existing gameplay scan.
 local resources=regionIndex==1 and {"Wood","Herb","Crystal"} or {"Ore","Crystal","Herb"}
 for j=1,2 do local pos=at+Vector3.new((j==1 and -1 or 1)*14,1,10);local item=resources[i]
  local q=marker(site,"Gather_"..item.."_Site"..i.."_"..j,pos,"Gathering",r.id);q:SetAttribute("ResourceId",item);CS:AddTag(q,"EldoriaMarker")
  local art=assets.Items[item]:Clone();art.Name="GatheringArtwork_"..j;art:PivotTo(CFrame.new(pos-Vector3.yAxis));art.Parent=site
 end
 -- A readable destination sign, not a random floating label.
 local post=part(site,"WayfindingPost",Vector3.new(.6,6,.6),CFrame.new(at+Vector3.new(-16,3,20)),Enum.Material.Wood,Color3.fromRGB(85,65,44))
 local board=part(site,"DestinationSign",Vector3.new(14,3,.6),CFrame.new(at+Vector3.new(-16,6,20)),Enum.Material.Wood,Color3.fromRGB(62,51,42),false)
 local gui=Instance.new("SurfaceGui");gui.Face=Enum.NormalId.Front;gui.CanvasSize=Vector2.new(560,120);gui.Parent=board;local label=Instance.new("TextLabel");label.Size=UDim2.fromScale(1,1);label.BackgroundTransparency=1;label.Text=r.sites[i];label.TextColor3=Color3.fromRGB(239,220,171);label.TextScaled=true;label.Font=Enum.Font.Garamond;label.Parent=gui
end
-- Designed ridge groups enclose each basin; clear arrival corridors stay open.
for j=0,19 do local a=(j+.3)*math.pi*2/20;local x,z=math.cos(a)*490,math.sin(a)*490
 if math.abs(x)>110 and math.abs(z)>95 then mesh(scenery,"RidgeCluster_"..j,r.rock,origin+Vector3.new(x,height(x,z,regionIndex)-5,z),5+(j%3)*1.1,j*53) end
end
-- Vegetation belongs to clearings and trail edges, with controlled clusters.
if regionIndex==1 then
 for g,center in {{-250,-230},{100,-100},{300,90},{-120,240},{-435,280},{280,-410},{440,250}} do
  for j=0,7 do local a=j*2.4;local rad=30+(j%3)*24;local x,z=center[1]+math.cos(a)*rad,center[2]+math.sin(a)*rad;mesh(scenery,"Grove_"..g.."_Oak_"..j,"ElderOak",origin+Vector3.new(x,height(x,z,regionIndex),z),1.25+(j%3)*.2,j*71) end
 end
 for i,p in side do for j=0,7 do local a=j*math.pi/4;mesh(scenery,"HerbGarden_"..i.."_"..j,"FernCluster",origin+vec(p)+Vector3.new(math.cos(a)*22,0,math.sin(a)*22),1.8,j*30) end end
else
 for i,p in side do for j=0,4 do local a=j*1.8;local x,z=p[1]+math.cos(a)*74,p[3]+math.sin(a)*74;mesh(scenery,"Outcrop_"..i.."_"..j,r.rock,origin+Vector3.new(x,height(x,z,regionIndex),z),1.2+j*.22,j*47) end end
end
-- Light waypoints at junctions keep the route readable at ground level.
for i,p in nodes do mesh(scenery,"TrailShrine_"..i,"WayShrine",origin+vec(p)+Vector3.new(22,0,22),.8,i*27) end
-- One elevated optional vista reached by a proper sloped bridge.
local a=origin+Vector3.new(410,1,30);local b=origin+Vector3.new(455,28,175)
route(routes,"VistaAscent",a,b,12,r.color)
part(scenery,"VistaDeck",Vector3.new(44,3,40),CFrame.new(b+Vector3.new(0,-1.5,12)),Enum.Material.Slate,r.color)
local sideVec=CFrame.lookAt(a,b).RightVector
for _,sign in {-1,1} do
 local rail=route(scenery,"VistaHandrail_"..sign,a+sideVec*6.2+Vector3.new(0,3,0),b+sideVec*6.2+Vector3.new(0,3,0),.5,Color3.fromRGB(104,90,72));rail.Size=Vector3.new(.5,1,rail.Size.Z)
 for j=0,6 do local at=a:Lerp(b,j/6)+sideVec*6.2;part(scenery,"VistaRailPost",Vector3.new(.5,3,.5),CFrame.new(at+Vector3.new(0,1.5,0)),Enum.Material.Wood,r.color) end
end
marker(f,"Vista_"..r.id,b+Vector3.new(0,1,12),"Vista",r.id)
mesh(scenery,"VistaReliquary","StormObelisk",b+Vector3.new(0,0,22),1.3,0)
return {region=r.id,models=#scenery:GetChildren(),sites=3}
`;
for (const [name, body] of Object.entries({ prepare, terrain, furnish }))
  writeFileSync(new URL(name + ".luau", import.meta.url), body);
export const connections =
  common +
  String.raw`
assert(not world:FindFirstChild("WorldTrails"))
local f=folder(world,"WorldTrails");local terr=workspace.Terrain
local trails={
 {name="CinderPass",ids={"Verdant","Ember"},points={{-576,0,0},{-760,0,-170},{-810,0,-640},{-874,0,-1100}}},
 {name="AuroraPass",ids={"Verdant","Frost"},points={{-80,0,-576},{140,0,-780},{590,0,-940},{970,0,-974}}},
 {name="ZephyrCauseway",ids={"Verdant","Storm"},points={{576,0,0},{775,0,110},{870,0,450},{974,0,650}}},
 {name="VeilwoodDescent",ids={"Verdant","Umbral"},points={{20,0,576},{-230,0,780},{-520,0,1010},{-574,0,1250}}},
 {name="NorthernPilgrimWay",ids={"Ember","Frost"},points={{-1530,0,-1676},{-1230,0,-1920},{-420,0,-2160},{340,0,-2200},{970,0,-2126}}},
 {name="EasternSkyroad",ids={"Frost","Storm"},points={{1626,0,-1550},{2020,0,-1120},{2190,0,-320},{2126,0,650}}},
 {name="SouthernSoulroad",ids={"Storm","Umbral"},points={{1570,0,1226},{1320,0,1570},{610,0,1850},{-260,0,2070},{-1130,0,1826}}},
 {name="WesternAshroad",ids={"Umbral","Ember"},points={{-1726,0,1250},{-2100,0,760},{-2210,0,-50},{-2150,0,-600},{-2026,0,-1100}}},
}
for _,t in trails do
 local group=folder(f,t.name);group:SetAttribute("FromRegion",t.ids[1]);group:SetAttribute("ToRegion",t.ids[2])
 for j=1,#t.points-1 do local a,b=vec(t.points[j]),vec(t.points[j+1]);local d=(b-a).Magnitude;local cf=CFrame.lookAt((a+b)/2,b)
  -- A broad terrain valley supports each winding connection.
  terr:FillBlock(cf*CFrame.new(0,-15,0),Vector3.new(110,30,d+85),Enum.Material.Ground)
  route(group,"Trail_"..j,a+Vector3.new(0,.65,0),b+Vector3.new(0,.65,0),22,Color3.fromRGB(114,103,82))
  local sideVector=cf.RightVector
  for k=1,math.floor(d/130) do local at=a:Lerp(b,k/(math.floor(d/130)+1));mesh(group,"Waystone_"..j.."_"..k,"WayShrine",at+sideVector*24,.85,j*37)
   for _,sideSign in {-1,1} do local q=at+sideVector*(75+12*(k%2))*sideSign;terr:FillBall(q-Vector3.new(0,12,0),34+(k%3)*7,Enum.Material.Rock) end
  end
 end
 marker(group,t.name.."_Entrance",vec(t.points[1])+Vector3.yAxis,"WorldRoute",t.ids[1]);marker(group,t.name.."_Exit",vec(t.points[#t.points])+Vector3.yAxis,"WorldRoute",t.ids[2])
end
-- Spawn remains beside the preserved starting settlement.
local spawn=workspace:FindFirstChildWhichIsA("SpawnLocation");if spawn then spawn.Position=Vector3.new(-85,1,-52) end
world:SetAttribute("Layout","Heartland + four surrounding basins + outer pilgrimage loop")
return {connections=#trails}
`;
writeFileSync(new URL("connections.luau", import.meta.url), connections);
export const polish =
  common +
  String.raw`
for i,r in regions do
 local m=world[r.name];local f=m.ExpansiveLandscape;local origin=Vector3.new(r.x,0,r.z);local sc=f.Scenery
 -- Fit entry art to the slanted approach while preserving the center-defining marker pair.
 for _,o in m:GetChildren() do if o.Name:match("^Entry") or o.Name=="EntranceLintel" or o.Name=="RegionSign" then move(o,Vector3.new(0,0,-23)) end end
 local gate=sc:FindFirstChild("ArrivalMoonGate");if gate then move(gate,Vector3.new(0,0,-23)) end
 -- Trail junction aprons remove sharp overlapping strip corners.
 for j,p in nodes do local disk=part(sc,"JunctionApron_"..j,Vector3.new(1,23,23),CFrame.new(origin+vec(p)+Vector3.new(0,.6,0))*CFrame.Angles(0,0,math.pi/2),Enum.Material.Ground,r.color);disk.Shape=Enum.PartType.Cylinder end
 if i==2 or i==5 then
  local disk=part(sc,i==2 and "CalderaPool" or "PoolOfEchoes",Vector3.new(.4,124,124),CFrame.new(origin+Vector3.new(150,-2.7,100))*CFrame.Angles(0,0,math.pi/2),Enum.Material.Neon,i==2 and Color3.fromRGB(246,83,23) or Color3.fromRGB(103,56,176),false);disk.Shape=Enum.PartType.Cylinder;disk.Transparency=i==2 and .05 or .28
 end
 local color=i==1 and Color3.fromRGB(207,230,152) or i==2 and Color3.fromRGB(255,105,36) or i==3 and Color3.fromRGB(151,222,255) or i==4 and Color3.fromRGB(171,191,255) or Color3.fromRGB(162,105,238)
 for j,p in side do local q=part(sc,"RegionalLight_"..j,Vector3.one,CFrame.new(origin+vec(p)+Vector3.new(0,12,0)),Enum.Material.SmoothPlastic,color,false);q.Transparency=1;q.CanQuery=false;local light=Instance.new("PointLight");light.Color=color;light.Brightness=1.5;light.Range=45;light.Parent=q end
 if i==5 then
  for j=0,2 do local a=j*math.pi/3;local p=origin+Vector3.new(280+math.cos(a)*90,5,290+math.sin(a)*90);mesh(sc,"SanctumSpire_"..j,"UnderworldCrag",p,10,j*60) end
 end
 local routes=f.Routes
 local shortcut=routes:FindFirstChild("LoopTrail_11");shortcut:Destroy()
 route(routes,"LoopTrail_11",origin+Vector3.new(-85,.65,-120),origin+Vector3.new(110,.65,-310),16,r.color)
 route(routes,"CampAlley",origin+Vector3.new(-85,.65,-64),origin+Vector3.new(-85,.65,-120),12,r.color)
 local notice=m:FindFirstChild("CampNotice");if notice then move(notice,Vector3.new(-40,0,0)) end
 for _,p in sc:GetChildren() do if p:IsA("BasePart") and p.Name:match("^VistaHandrail") then CS:RemoveTag(p,"EldoriaRoute");p:SetAttribute("RouteStart",nil);p:SetAttribute("RouteEnd",nil) end end
 -- Existing boss and NPC geometry remains unchanged; only landscape is added.
end
return {polished=true}
`;
writeFileSync(new URL("polish.luau", import.meta.url), polish);
export const finish =
  common +
  String.raw`
local forest=world[regions[1].name].ExpansiveLandscape
local sc=forest.Scenery
for i,p in side do
 for j=0,11 do local a=j*math.pi/6;local x,z=p[1]+math.cos(a)*68,p[3]+math.sin(a)*68
  -- Trees frame destination clearings; preserve the 22-stud trail corridor.
  local d=math.huge;for _,e in edges do d=math.min(d,distance(x,z,nodes[e[1]],nodes[e[2]])) end
  if d>24 then mesh(sc,"DestinationGrove_"..i.."_"..j,"ElderOak",Vector3.new(x,height(x,z,1)-1,z),1.8+(j%3)*.18,j*71) end
 end
end
local terrainOnly=RaycastParams.new();terrainOnly.FilterType=Enum.RaycastFilterType.Include;terrainOnly.FilterDescendantsInstances={workspace.Terrain}
local grounded=0
for _,r in regions do
 local f=world[r.name].ExpansiveLandscape
 for _,m in f:GetDescendants() do if m:IsA("Model") and (m.Name:match("^RidgeCluster") or m.Name:match("^Outcrop") or m.Name:match("^QuarryFace") or m.Name:match("^SanctumSpire")) then
  if r.id=="Verdant" and m.Name:match("^RidgeCluster") then m:ScaleTo(m:GetScale()*.7) end
  local cf,size=m:GetBoundingBox();local minY=math.huge
  for _,a in {{0,0},{-.3,-.3},{.3,-.3},{-.3,.3},{.3,.3}} do local at=cf.Position+Vector3.new(size.X*a[1],200,size.Z*a[2]);local hit=workspace:Raycast(at,Vector3.new(0,-500,0),terrainOnly);if hit then minY=math.min(minY,hit.Position.Y) end end
  if minY<math.huge then m:PivotTo(m:GetPivot()+Vector3.new(0,minY-(cf.Position.Y-size.Y*.5)-3,0));grounded+=1 end
 end end
end
for _,group in world.WorldTrails:GetChildren() do
 local paths={};for _,p in group:GetChildren() do if p:IsA("BasePart") and p:GetAttribute("RouteStart") then table.insert(paths,p) end end
 table.sort(paths,function(a,b)return a.Name<b.Name end)
 local p=paths[math.ceil(#paths/2)];if p then
  local a,b=p:GetAttribute("RouteStart"),p:GetAttribute("RouteEnd");local cf=CFrame.lookAt((a+b)/2,b);local at=(a+b)/2+cf.RightVector*39-Vector3.new(0,.65,0)
  local f=folder(group,"PilgrimWaystation")
  mesh(f,"Shelter","MerchantPavilion",at,1.15,0)
  mesh(f,"RestShrine","WayShrine",at+cf.LookVector*20,1.1,0)
  marker(f,"Discovery_"..group.Name.."_Waystation",at+Vector3.yAxis,"Discovery",group:GetAttribute("FromRegion"))
 end
end
world:SetAttribute("ExpansionComplete",true)
return {groundedRockClusters=grounded,waystations=8}
`;
writeFileSync(new URL("finish.luau", import.meta.url), finish);
