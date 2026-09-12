
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
