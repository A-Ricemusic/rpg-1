import React, { useEffect, useState } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import {
  CollectionService,
  Players,
  ReplicatedStorage,
  UserInputService,
  Workspace,
} from "@rbxts/services";
import { ABILITIES, LEVEL_CAP, QUESTS, xpForNextLevel } from "shared/GameConfig";
import { ClientRequest, PlayerSnapshot, ServerEvent } from "shared/GameTypes";

const player = Players.LocalPlayer;
const remotes = ReplicatedStorage.WaitForChild("RPGRemotes");
const requestRemote = remotes.WaitForChild("Request") as RemoteEvent;
const eventRemote = remotes.WaitForChild("Event") as RemoteEvent;

function send(request: ClientRequest): void {
  requestRemote.FireServer(request);
}

function bar(
  name: string,
  value: number,
  maximum: number,
  color: Color3,
  order: number,
): React.Element {
  const ratio = math.clamp(value / math.max(1, maximum), 0, 1);
  return (
    <frame
      key={name}
      BackgroundColor3={Color3.fromRGB(24, 28, 38)}
      BorderSizePixel={0}
      LayoutOrder={order}
      Size={UDim2.fromOffset(260, 24)}
    >
      <frame BackgroundColor3={color} BorderSizePixel={0} Size={UDim2.fromScale(ratio, 1)} />
      <textlabel
        BackgroundTransparency={1}
        Font={Enum.Font.GothamBold}
        Size={UDim2.fromScale(1, 1)}
        Text={`${name} ${math.floor(value)}/${maximum}`}
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextSize={13}
        ZIndex={2}
      />
    </frame>
  );
}

function App(): React.Element {
  const [snapshot, setSnapshot] = useState<PlayerSnapshot>();
  const [notice, setNotice] = useState("Activate your first quest to begin.");
  const [skillsOpen, setSkillsOpen] = useState(false);

  useEffect(() => {
    const connection = eventRemote.OnClientEvent.Connect((event: ServerEvent) => {
      if (event.kind === "Snapshot") setSnapshot(event.snapshot);
      else if (event.kind === "QuestCompleted")
        setNotice(`Completed ${event.questName} (+${event.xp} XP)`);
      else if (event.kind === "LevelUp")
        setNotice(`Level ${event.level}: ${event.ability.name} unlocked!`);
    });
    return () => connection.Disconnect();
  }, []);

  useEffect(() => {
    const connection = UserInputService.InputBegan.Connect((input, processed) => {
      if (!processed && input.KeyCode === Enum.KeyCode.K) setSkillsOpen((open) => !open);
    });
    return () => connection.Disconnect();
  }, []);

  if (!snapshot)
    return (
      <textlabel
        BackgroundTransparency={1}
        Size={UDim2.fromScale(1, 1)}
        Text="Loading RPG systems..."
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextSize={20}
      />
    );
  const quest = QUESTS[snapshot.questIndex];
  const xpGoal = snapshot.level < LEVEL_CAP ? xpForNextLevel(snapshot.level) : 1;
  return (
    <>
      <frame
        AnchorPoint={new Vector2(0, 1)}
        BackgroundColor3={Color3.fromRGB(12, 16, 25)}
        BackgroundTransparency={0.12}
        Position={UDim2.fromScale(0.018, 0.975)}
        Size={UDim2.fromOffset(280, 140)}
      >
        <uipadding PaddingLeft={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
        <uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder} />
        {bar("HP", snapshot.currentHealth, snapshot.maxHealth, Color3.fromRGB(210, 55, 65), 1)}
        {bar(
          "Magicka",
          snapshot.currentMagicka,
          snapshot.maxMagicka,
          Color3.fromRGB(60, 125, 245),
          2,
        )}
        {bar(
          "Stamina",
          snapshot.currentStamina,
          snapshot.maxStamina,
          Color3.fromRGB(55, 195, 105),
          3,
        )}
        {bar(`Level ${snapshot.level} XP`, snapshot.xp, xpGoal, Color3.fromRGB(190, 115, 245), 4)}
      </frame>
      <frame
        AnchorPoint={new Vector2(1, 0)}
        BackgroundColor3={Color3.fromRGB(12, 16, 25)}
        BackgroundTransparency={0.08}
        Position={UDim2.fromScale(0.982, 0.03)}
        Size={UDim2.fromOffset(340, 180)}
      >
        <textlabel
          BackgroundTransparency={1}
          Font={Enum.Font.GothamBold}
          Position={UDim2.fromOffset(12, 10)}
          Size={UDim2.fromOffset(316, 28)}
          Text={
            quest
              ? `Quest ${snapshot.questIndex + 1}/${QUESTS.size()}: ${quest.name}`
              : "Questline Complete"
          }
          TextColor3={Color3.fromRGB(255, 220, 105)}
          TextSize={18}
          TextXAlignment={Enum.TextXAlignment.Left}
        />
        <textlabel
          BackgroundTransparency={1}
          Position={UDim2.fromOffset(12, 42)}
          Size={UDim2.fromOffset(316, 48)}
          Text={quest?.description ?? "You recovered every relic in the Vale."}
          TextColor3={Color3.fromRGB(230, 235, 245)}
          TextSize={15}
          TextWrapped
          TextXAlignment={Enum.TextXAlignment.Left}
          TextYAlignment={Enum.TextYAlignment.Top}
        />
        {quest && (
          <textbutton
            BackgroundColor3={
              snapshot.questActive ? Color3.fromRGB(160, 60, 60) : Color3.fromRGB(55, 135, 90)
            }
            Font={Enum.Font.GothamBold}
            Position={UDim2.fromOffset(12, 105)}
            Size={UDim2.fromOffset(316, 42)}
            Text={snapshot.questActive ? "Deactivate Quest" : "Activate Quest"}
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextSize={16}
            Event={{
              Activated: () => send({ kind: "SetQuestActive", active: !snapshot.questActive }),
            }}
          />
        )}
        <textlabel
          BackgroundTransparency={1}
          Position={UDim2.fromOffset(12, 151)}
          Size={UDim2.fromOffset(316, 20)}
          Text={notice}
          TextColor3={Color3.fromRGB(180, 205, 235)}
          TextSize={12}
          TextWrapped
        />
      </frame>
      <textbutton
        AnchorPoint={new Vector2(0.5, 1)}
        BackgroundColor3={Color3.fromRGB(45, 52, 75)}
        Position={UDim2.fromScale(0.5, 0.945)}
        Size={UDim2.fromOffset(150, 40)}
        Text="Skills [K]"
        TextColor3={Color3.fromRGB(255, 255, 255)}
        Event={{ Activated: () => setSkillsOpen(!skillsOpen) }}
      />
      {skillsOpen && (
        <scrollingframe
          AnchorPoint={new Vector2(0.5, 0.5)}
          AutomaticCanvasSize={Enum.AutomaticSize.Y}
          BackgroundColor3={Color3.fromRGB(15, 19, 30)}
          CanvasSize={new UDim2()}
          Position={UDim2.fromScale(0.5, 0.48)}
          ScrollBarThickness={7}
          Size={UDim2.fromOffset(480, 520)}
        >
          <uipadding
            PaddingLeft={new UDim(0, 14)}
            PaddingRight={new UDim(0, 14)}
            PaddingTop={new UDim(0, 14)}
          />
          <uilistlayout Padding={new UDim(0, 7)} SortOrder={Enum.SortOrder.LayoutOrder} />
          <textlabel
            BackgroundTransparency={1}
            LayoutOrder={0}
            Size={UDim2.fromOffset(440, 42)}
            Text="SKILL TREE — One ability per level"
            TextColor3={Color3.fromRGB(255, 220, 105)}
            TextSize={20}
            Font={Enum.Font.GothamBold}
          />
          {ABILITIES.map((ability) => (
            <textlabel
              key={ability.level}
              BackgroundColor3={
                ability.level <= snapshot.level
                  ? Color3.fromRGB(45, 95, 75)
                  : Color3.fromRGB(38, 42, 52)
              }
              LayoutOrder={ability.level}
              Size={UDim2.fromOffset(440, 52)}
              Text={`  Lv.${ability.level}  ${ability.name} — ${ability.description} (+${ability.bonus} ${ability.stat})`}
              TextColor3={
                ability.level <= snapshot.level
                  ? Color3.fromRGB(240, 255, 245)
                  : Color3.fromRGB(145, 150, 165)
              }
              TextSize={13}
              TextWrapped
              TextXAlignment={Enum.TextXAlignment.Left}
            />
          ))}
        </scrollingframe>
      )}
      <textlabel
        AnchorPoint={new Vector2(0.5, 1)}
        BackgroundTransparency={1}
        Position={UDim2.fromScale(0.5, 0.99)}
        Size={UDim2.fromOffset(500, 24)}
        Text="Left Click: Laser Bolt   •   Hold F: Block   •   K: Skills"
        TextColor3={Color3.fromRGB(235, 240, 255)}
        TextSize={14}
      />
    </>
  );
}

const gui = new Instance("ScreenGui");
gui.Name = "RPGHud";
gui.ResetOnSpawn = false;
gui.IgnoreGuiInset = true;
gui.Parent = player.WaitForChild("PlayerGui");
createRoot(gui).render(<App />);

let indicator: BillboardGui | undefined;
let indicatorTargetId: string | undefined;
eventRemote.OnClientEvent.Connect((event: ServerEvent) => {
  if (event.kind === "CombatHit") {
    const distance = event.position.sub(event.origin).Magnitude;
    const bolt = new Instance("Part");
    bolt.Name = "LaserBolt";
    bolt.Anchored = true;
    bolt.CanCollide = false;
    bolt.Material = Enum.Material.Neon;
    bolt.Color = Color3.fromRGB(80, 190, 255);
    bolt.Size = new Vector3(0.3, 0.3, distance);
    bolt.CFrame = CFrame.lookAt(event.origin, event.position).mul(new CFrame(0, 0, -distance / 2));
    bolt.Parent = Workspace;
    task.delay(0.08, () => bolt.Destroy());
    return;
  }
  if (event.kind !== "Snapshot") return;
  const quest = QUESTS[event.snapshot.questIndex];
  const desiredTargetId = event.snapshot.questActive ? quest?.targetId : undefined;
  if (desiredTargetId === indicatorTargetId && indicator?.Parent !== undefined) return;
  indicator?.Destroy();
  indicator = undefined;
  indicatorTargetId = desiredTargetId;
  if (!quest || !desiredTargetId) return;
  const target = CollectionService.GetTagged("QuestCollectible").find(
    (item) => item.GetAttribute("QuestTargetId") === quest.targetId,
  );
  if (!target?.IsA("BasePart")) return;
  indicator = new Instance("BillboardGui");
  indicator.Name = "QuestIndicator";
  indicator.Adornee = target;
  indicator.AlwaysOnTop = true;
  indicator.Size = UDim2.fromOffset(150, 70);
  indicator.StudsOffset = new Vector3(0, 4, 0);
  indicator.Parent = gui;
  const label = new Instance("TextLabel");
  label.BackgroundTransparency = 1;
  label.Size = UDim2.fromScale(1, 1);
  label.Text = `◆\n${quest.name}`;
  label.TextColor3 = Color3.fromRGB(255, 225, 70);
  label.TextStrokeTransparency = 0.2;
  label.TextSize = 16;
  label.Font = Enum.Font.GothamBold;
  label.Parent = indicator;
});

UserInputService.InputBegan.Connect((input, processed) => {
  if (processed) return;
  if (input.UserInputType === Enum.UserInputType.MouseButton1) {
    const camera = Workspace.CurrentCamera;
    const head = player.Character?.FindFirstChild("Head");
    if (camera && head?.IsA("BasePart"))
      send({
        kind: "PrimaryAttack",
        origin: head.Position,
        direction: camera.CFrame.LookVector,
      });
  } else if (input.KeyCode === Enum.KeyCode.F) send({ kind: "SetBlocking", blocking: true });
});
UserInputService.InputEnded.Connect((input) => {
  if (input.KeyCode === Enum.KeyCode.F) send({ kind: "SetBlocking", blocking: false });
});

send({ kind: "RequestSnapshot" });
