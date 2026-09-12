// Read-only grounding verification; decorative character bodies are not floors.
import { writeFileSync } from "node:fs";
export const markers = String.raw`
assert(not game:GetService("RunService"):IsRunning());local w=assert(workspace:FindFirstChild("EldoriaWorld"));assert(game.ReplicatedStorage:FindFirstChild("GameAssets"))
local floor={workspace.Terrain}
for _,d in w:GetDescendants() do if d:IsA("BasePart") and d.CanCollide then
 local actor=false;local a=d.Parent
 while a and a~=w do if a:IsA("Model") and a:FindFirstChildOfClass("Humanoid") then actor=true;break end;a=a.Parent end
 if not actor then table.insert(floor,d) end
end end
local p=RaycastParams.new();p.RespectCanCollide=true;p.FilterType=Enum.RaycastFilterType.Include;p.FilterDescendantsInstances=floor
local bad={};local n=0
for _,d in w:GetDescendants() do if d:IsA("BasePart") and table.find({"Gathering","EnemySpawn","BossSpawn","CampSpawn","QuestGiver","Merchant","Blacksmith"},d:GetAttribute("MarkerType")) then
 n+=1;local h=workspace:Raycast(d.Position+Vector3.new(0,6,0),Vector3.new(0,-20,0),p)
 if not h or h.Position.Y>d.Position.Y+2 or h.Position.Y<d.Position.Y-4 then table.insert(bad,{name=d:GetFullName(),position=tostring(d.Position),floor=h and tostring(h.Position) or "none"}) end
end end
return {checkedMarkers=n,errors=bad,placeId=game.PlaceId}
`;
writeFileSync(new URL("markers.luau", import.meta.url), markers);
