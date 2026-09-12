
assert(not game:GetService("RunService"):IsRunning());local w=assert(workspace:FindFirstChild("EldoriaWorld"));local assets=assert(game.ReplicatedStorage:FindFirstChild("GameAssets"))
local sources={};for _,m in assets.RefinedArt:GetChildren() do for _,p in m:GetChildren() do if p:IsA("MeshPart") then table.insert(sources,{content=p.MeshContent,key=m.Name.."__"..p.Name}) end end end
local tagged,missing=0,{}
for _,root in {assets,w} do for _,p in root:GetDescendants() do if p:IsA("MeshPart") then
 local found=false;for _,s in sources do if p.MeshContent==s.content or (p.MeshContent.Object and p.MeshContent.Object==s.content.Object) then p:SetAttribute("ImportKey",s.key);tagged+=1;found=true;break end end
 if not found and #missing<20 then table.insert(missing,p:GetFullName()) end
end end end
-- Preserve terrain before removing obstructive grass from settlements and trails.
local backup=workspace.Terrain:CopyRegion(Region3int16.new(Vector3int16.new(-600,-20,-600),Vector3int16.new(600,40,550)));backup.Name="TerrainBeforePlayabilityRepair";backup.Parent=game.ServerStorage
local patches=0
for _,r in w:GetChildren() do if r:IsA("Model") and r:GetAttribute("WorldCenter") then
 local c=r:GetAttribute("WorldCenter")+Vector3.new(-85,0,-64)
 workspace.Terrain:ReplaceMaterial(Region3.new(c-Vector3.new(76,12,58),c+Vector3.new(76,12,58)):ExpandToGrid(4),4,Enum.Material.Grass,Enum.Material.Ground);patches+=1
end end
for _,p in game:GetService("CollectionService"):GetTagged("EldoriaRoute") do if p:IsDescendantOf(w) then
 local a,b=p:GetAttribute("RouteStart"),p:GetAttribute("RouteEnd");local n=math.ceil((b-a).Magnitude/16)
 for j=0,n do local c=a:Lerp(b,j/n);workspace.Terrain:ReplaceMaterial(Region3.new(c-Vector3.new(12,8,12),c+Vector3.new(12,8,12)):ExpandToGrid(4),4,Enum.Material.Grass,Enum.Material.Ground) end
end end
return {meshesTagged=tagged,unmatched=missing,campsCleared=patches}
