
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
