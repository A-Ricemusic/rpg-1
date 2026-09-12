
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
