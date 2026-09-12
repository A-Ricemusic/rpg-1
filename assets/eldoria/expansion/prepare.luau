
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
