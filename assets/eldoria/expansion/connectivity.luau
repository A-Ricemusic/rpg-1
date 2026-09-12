
assert(not game:GetService("RunService"):IsRunning());local w=assert(workspace:FindFirstChild("EldoriaWorld"));assert(game.ReplicatedStorage:FindFirstChild("GameAssets"))
local positions,parents,names={},{},{}
local function node(p,name) for i,v in positions do if (v-p).Magnitude<3 then return i end end;table.insert(positions,p);local i=#positions;parents[i]=i;names[i]=name;return i end
local function root(i) while parents[i]~=i do i=parents[i] end;return i end
for _,p in game:GetService("CollectionService"):GetTagged("EldoriaRoute") do if p:IsDescendantOf(w) then local a,b=node(p:GetAttribute("RouteStart"),p:GetFullName()),node(p:GetAttribute("RouteEnd"),p:GetFullName());parents[root(a)]=root(b) end end
local groups={};local count=0
for i in positions do local r=root(i);if not groups[r] then groups[r]={};count+=1 end;table.insert(groups[r],names[i]) end
local lengths={};for _,g in groups do table.insert(lengths,#g) end
return {connectedComponents=count,junctions=#positions,componentSizes=lengths}
