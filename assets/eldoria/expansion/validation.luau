
assert(not game:GetService("RunService"):IsRunning())
local w=assert(workspace:FindFirstChild("EldoriaWorld"));assert(game.ReplicatedStorage:FindFirstChild("GameAssets"))
local cs=game:GetService("CollectionService");local params=RaycastParams.new();params.RespectCanCollide=true;params.FilterType=Enum.RaycastFilterType.Include;params.FilterDescendantsInstances={w,workspace.Terrain}
local overlap=OverlapParams.new();overlap.RespectCanCollide=true;overlap.FilterType=Enum.RaycastFilterType.Include;overlap.FilterDescendantsInstances={w}
local errors={};local samples=0;local length=0;local routeCount=0
for _,p in cs:GetTagged("EldoriaRoute") do if p:IsDescendantOf(w) and p:IsA("BasePart") then
 local a,b=p:GetAttribute("RouteStart"),p:GetAttribute("RouteEnd");local d=(b-a).Magnitude;length+=d;routeCount+=1
 local n=math.ceil(d/10)
 for j=0,n do local at=a:Lerp(b,j/n);samples+=1
  local hit=workspace:Raycast(at+Vector3.new(0,8,0),Vector3.new(0,-22,0),params)
  if not hit or math.abs(hit.Position.Y-(at.Y+.6))>2 then if #errors<80 then table.insert(errors,{route=p:GetFullName(),sample=j,kind="floor",position=tostring(at),hit=hit and tostring(hit.Position) or "none"}) end end
  local ceiling=workspace:Blockcast(CFrame.new(at+Vector3.new(0,2.2,0)),Vector3.new(4,.25,4),Vector3.new(0,4.5,0),params)
  if ceiling and #errors<80 then table.insert(errors,{route=p:GetFullName(),sample=j,kind="headroom",object=ceiling.Instance:GetFullName()}) end
 end
end end
local markers={};local discoveries=0
for _,d in w:GetDescendants() do if d:IsA("BasePart") and d:GetAttribute("MarkerType") then local k=d:GetAttribute("MarkerType");markers[k]=(markers[k] or 0)+1;if k=="Discovery" then discoveries+=1 end end end
local toolsOk=true;for _,t in game.ReplicatedStorage.GameAssets.Weapons:GetChildren() do if t:IsA("Tool") then if not t:FindFirstChild("Handle") then toolsOk=false end;for _,p in t:GetDescendants() do if p:IsA("BasePart") and (p.Anchored or p.CanCollide) then toolsOk=false end end end end
return {routeCount=routeCount,samples=samples,routeLengthStuds=math.floor(length),errors=errors,markers=markers,discoveries=discoveries,weaponsUnchangedAndUsable=toolsOk}
