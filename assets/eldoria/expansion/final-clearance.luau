assert(not game:GetService("RunService"):IsRunning());local w=assert(workspace:FindFirstChild("EldoriaWorld"))
for _,r in w:GetChildren() do local f=r:FindFirstChild("ExpansiveLandscape");if f then
 local p=f.Routes.LoopTrail_11;local a,b=p:GetAttribute("RouteStart"),p:GetAttribute("RouteEnd");local cf=CFrame.lookAt((a+b)/2,b)
 workspace.Terrain:FillBlock(cf*CFrame.new(0,8,0),Vector3.new(28,16,(b-a).Magnitude+4),Enum.Material.Air)
 workspace.Terrain:FillBlock(cf*CFrame.new(0,-8.65,0),Vector3.new(28,16,(b-a).Magnitude+4),r:GetAttribute("RegionId")=="Frost" and Enum.Material.Snow or Enum.Material.Ground)
 for _,rail in f.Scenery:GetChildren() do if rail:IsA("BasePart") and rail.Name:match("^VistaHandrail") then
  local length=rail.Size.Z;rail.CFrame=rail.CFrame*CFrame.new(0,0,-12);rail.Size=Vector3.new(.5,1,length-24)
 end end
end end
return "Shortcut terrain and lookout landing cleared"
