/** Edit-time asset repair helpers. Never install as gameplay scripts. */
import { writeFileSync } from "node:fs";
export const prepare = String.raw`
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
`;
export const adopt = String.raw`
assert(not game:GetService("RunService"):IsRunning());local w=assert(workspace:FindFirstChild("EldoriaWorld"));local assets=assert(game.ReplicatedStorage:FindFirstChild("GameAssets"))
local imported=assert(workspace:FindFirstChild("Eldoria-import-library"),"Import the FBX first and name its root Eldoria-import-library")
local byKey={};for _,p in imported:GetDescendants() do if p:IsA("MeshPart") then byKey[p.Name]=p end end
-- Preflight every source before changing any artwork.
for _,model in assets.RefinedArt:GetChildren() do for _,p in model:GetChildren() do if p:IsA("MeshPart") then local key=model.Name.."__"..p.Name;local incoming=assert(byKey[key],"Missing imported mesh "..key);assert(incoming.MeshId~="","Missing persistent MeshId for "..key) end end end
local replaced=0
for _,root in {assets,w} do for _,p in root:GetDescendants() do if p:IsA("MeshPart") then local key=p:GetAttribute("ImportKey");local incoming=key and byKey[key];if incoming then
 local size,cf,color,material=p.Size,p.CFrame,p.Color,p.Material
 p:ApplyMesh(incoming);p.Size=size;p.CFrame=cf;p.Color=color;p.Material=material
 for _,sa in p:GetChildren() do if sa:IsA("SurfaceAppearance") then sa:Destroy() end end
 local sa=incoming:FindFirstChildOfClass("SurfaceAppearance");if sa then sa:Clone().Parent=p end
 p:SetAttribute("MeshPersistence","Imported asset ID; client verification pending");p:SetAttribute("VerifiedImport",false);replaced+=1
end end end end
imported.Parent=game.ServerStorage
return {replaced=replaced,next="Start Play, preload each imported mesh/texture on Client, equip weapons and inspect actual rendering before claiming completion."}
`;
for (const [name, code] of Object.entries({ prepare, adopt }))
  writeFileSync(new URL(name + ".luau", import.meta.url), code);
