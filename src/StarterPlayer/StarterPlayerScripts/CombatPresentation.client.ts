import { Debris, Players, ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";

interface Presentation {
  kind: string;
  position: Vector3;
  origin: Vector3;
  direction: Vector3;
  effect: string;
  combo: number;
  playerId: number;
  amount: number;
  label: string;
  killed: boolean;
}
const colors: Record<string, Color3> = {
  Zeus: Color3.fromRGB(255, 230, 110),
  Poseidon: Color3.fromRGB(70, 225, 255),
  Hades: Color3.fromRGB(185, 95, 255),
  Sword: Color3.fromRGB(255, 225, 180),
  Trident: Color3.fromRGB(110, 240, 240),
  Bow: Color3.fromRGB(195, 255, 130),
};
const folder = new Instance("Folder");
folder.Name = "DemigodClientEffects";
folder.Parent = Workspace;
const poses = new Map<Motor6D, { base: CFrame; tween: Tween; token: number }>();
let poseToken = 0;
function pose(e: Presentation): void {
  const character = Players.GetPlayerByUserId(e.playerId)?.Character;
  if (!character) return;
  poseToken++;
  const token = poseToken;
  for (const joint of character.GetDescendants()) {
    if (!joint.IsA("Motor6D")) continue;
    const right = joint.Name === "RightShoulder" || joint.Name === "Right Shoulder";
    const left = joint.Name === "LeftShoulder" || joint.Name === "Left Shoulder";
    if (
      !right &&
      !(left && (e.effect === "Poseidon" || e.effect === "Hades" || e.effect === "Bow"))
    )
      continue;
    const old = poses.get(joint);
    old?.tween.Cancel();
    const base = old?.base ?? joint.C0;
    const angle = e.effect === "Zeus" ? -110 : e.effect === "Hades" ? -35 : -65;
    const tween = TweenService.Create(joint, new TweenInfo(0.09), {
      C0: base.mul(CFrame.Angles(math.rad(angle), 0, math.rad(left ? -15 : 15))),
    });
    poses.set(joint, { base, tween, token });
    tween.Play();
    task.delay(0.12, () => {
      const active = poses.get(joint);
      if (!active || active.token !== token) return;
      if (!joint.Parent) {
        poses.delete(joint);
        return;
      }
      const recovery = TweenService.Create(joint, new TweenInfo(0.18), { C0: base });
      active.tween = recovery;
      recovery.Play();
      task.delay(0.2, () => {
        if (poses.get(joint)?.token === token) {
          if (joint.Parent) joint.C0 = base;
          poses.delete(joint);
        }
      });
    });
  }
}
function part(position: Vector3, size: Vector3, color: Color3, lifetime = 0.4): Part {
  const p = new Instance("Part");
  p.Anchored = true;
  p.CanCollide = false;
  p.CanQuery = false;
  p.CanTouch = false;
  p.Material = Enum.Material.Neon;
  p.Color = color;
  p.Size = size;
  p.Position = position;
  p.CastShadow = false;
  p.Parent = folder;
  TweenService.Create(p, new TweenInfo(lifetime), { Transparency: 1 }).Play();
  Debris.AddItem(p, lifetime + 0.05);
  return p;
}
function line(a: Vector3, b: Vector3, color: Color3, width = 0.15): void {
  if (b.sub(a).Magnitude < 0.01) return;
  const p = part(a.add(b).div(2), new Vector3(width, width, b.sub(a).Magnitude), color);
  p.CFrame = CFrame.lookAt(a.add(b).div(2), b);
}
function arc(
  origin: Vector3,
  forward: Vector3,
  radius: number,
  color: Color3,
  spread = math.pi,
): void {
  const flat = new Vector3(forward.X, 0, forward.Z);
  const frame = CFrame.lookAt(
    origin,
    origin.add(flat.Magnitude > 0.01 ? flat.Unit : new Vector3(0, 0, -1)),
  );
  for (let i = 0; i < 16; i++) {
    const a = -spread / 2 + (spread * i) / 16;
    const b = -spread / 2 + (spread * (i + 1)) / 16;
    line(
      frame.PointToWorldSpace(new Vector3(math.sin(a) * radius, 0, -math.cos(a) * radius)),
      frame.PointToWorldSpace(new Vector3(math.sin(b) * radius, 0, -math.cos(b) * radius)),
      color,
      0.22,
    );
  }
}
function impact(e: Presentation): void {
  if (e.playerId !== Players.LocalPlayer.UserId) return;
  const anchor = part(e.position.add(new Vector3(0, 3, 0)), Vector3.one.mul(0.05), new Color3());
  anchor.Transparency = 1;
  const gui = new Instance("BillboardGui");
  gui.Size = UDim2.fromOffset(180, 65);
  gui.AlwaysOnTop = true;
  gui.Parent = anchor;
  const label = new Instance("TextLabel");
  label.Size = UDim2.fromScale(1, 1);
  label.BackgroundTransparency = 1;
  label.Font = Enum.Font.GothamBold;
  label.TextSize = e.label !== "" ? 22 : 18;
  label.TextColor3 = e.killed ? Color3.fromRGB(255, 215, 100) : new Color3(1, 1, 1);
  label.TextStrokeTransparency = 0.3;
  label.Text = `${e.amount}${e.label !== "" ? `\n${e.label}` : ""}`;
  label.Parent = gui;
  TweenService.Create(anchor, new TweenInfo(0.4), {
    Position: anchor.Position.add(new Vector3(0, 2, 0)),
  }).Play();
}
const event = ReplicatedStorage.WaitForChild("RPGRemotes").WaitForChild("Event") as RemoteEvent;
event.OnClientEvent.Connect((raw: unknown) => {
  if (!typeIs(raw, "table")) return;
  const e = raw as Presentation;
  if ((e.kind !== "Cast" && e.kind !== "Impact") || !typeIs(e.position, "Vector3")) return;
  const camera = Workspace.CurrentCamera;
  if (!camera || camera.CFrame.Position.sub(e.position).Magnitude > 250) return;
  if (e.kind === "Impact") {
    impact(e);
    return;
  }
  pose(e);
  const color = colors[e.effect] ?? new Color3(1, 1, 1);
  if (e.effect === "Zeus") {
    let previous = e.position.add(new Vector3(0, 35, 0));
    for (let i = 1; i <= 8; i++) {
      const point =
        i === 8
          ? e.position
          : e.position.add(new Vector3(math.random(-4, 4), 35 * (1 - i / 8), math.random(-4, 4)));
      line(previous, point, color, 0.35);
      previous = point;
    }
    arc(e.position, e.direction, 5, color, math.pi * 2);
  } else if (e.effect === "Poseidon") {
    for (let i = 0; i < 5; i++)
      task.delay(i * 0.065, () =>
        arc(e.origin.sub(new Vector3(0, 2, 0)), e.direction, 4 + i * 6, color, 2.1),
      );
  } else if (e.effect === "Hades") {
    for (let i = 0; i < 4; i++)
      task.delay(i * 0.06, () => {
        arc(e.origin.sub(new Vector3(0, 2, 0)), e.direction, 3 + i * 5, color, math.pi * 2);
        for (let j = 0; j < 4; j++) {
          const angle = (j * math.pi) / 2 + i;
          const p = part(
            e.origin.add(new Vector3(math.sin(angle) * 10, -1, math.cos(angle) * 10)),
            new Vector3(0.3, 3, 0.3),
            color,
          );
          TweenService.Create(p, new TweenInfo(0.4), {
            Position: e.origin,
            Size: Vector3.one.mul(0.1),
          }).Play();
        }
      });
  } else if (e.effect === "Sword") {
    arc(e.origin, e.direction, e.combo === 3 ? 9 : 6, color, e.combo === 3 ? 4.2 : 2.5);
  } else {
    const endpoint = e.effect === "Trident" ? e.origin.add(e.direction.mul(14)) : e.position;
    line(e.origin, endpoint, color, e.effect === "Bow" ? 0.12 : 0.3);
  }
});
