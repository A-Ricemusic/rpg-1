import React, { useEffect, useState } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import {
  ContextActionService,
  Debris,
  GuiService,
  Players,
  ReplicatedStorage,
  StarterGui,
  TweenService,
  UserInputService,
  Workspace,
} from "@rbxts/services";
import {
  AdventureRequest,
  AdventureSnapshot,
  ITEMS,
  PARENTS,
  PRICES,
  REGIONS,
  SELL_PRICES,
  WEAPONS,
} from "shared/Adventure";
const player = Players.LocalPlayer;
const remotes = ReplicatedStorage.WaitForChild("RPGRemotes");
const request = remotes.WaitForChild("Request") as RemoteEvent;
const event = remotes.WaitForChild("Event") as RemoteEvent;
function send(r: AdventureRequest): void {
  request.FireServer(r);
}
let menuOpen = false;
let combatReady = false;
let equippedIndex = 0;
function aim(kind: "Attack" | "Ability"): void {
  if (menuOpen || !combatReady || UserInputService.GetFocusedTextBox()) return;
  const camera = Workspace.CurrentCamera;
  const root = player.Character?.FindFirstChild("HumanoidRootPart");
  if (!camera || !root?.IsA("BasePart")) return;
  const ray = camera.ViewportPointToRay(camera.ViewportSize.X / 2, camera.ViewportSize.Y / 2);
  const params = new RaycastParams();
  params.FilterType = Enum.RaycastFilterType.Exclude;
  params.FilterDescendantsInstances = player.Character ? [player.Character] : [];
  const hit = Workspace.Raycast(ray.Origin, ray.Direction.mul(500), params);
  const point = hit?.Position ?? ray.Origin.add(ray.Direction.mul(500));
  const delta = point.sub(root.Position.add(new Vector3(0, 1, 0)));
  send({ kind, direction: delta.Magnitude > 0.1 ? delta.Unit : root.CFrame.LookVector });
}
const gold = Color3.fromRGB(240, 205, 126);
const ink = Color3.fromRGB(16, 23, 34);
function Button(props: {
  name: string;
  text: string;
  action: () => void;
  order?: number;
  enabled?: boolean;
  size?: UDim2;
  modal?: boolean;
}): React.Element {
  return (
    <textbutton
      key={props.name}
      ref={(instance) => {
        if (instance) instance.Name = props.name;
      }}
      LayoutOrder={props.order}
      Size={props.size ?? new UDim2(1, 0, 0, 36)}
      Modal={props.modal}
      Active={props.enabled !== false}
      Selectable={props.enabled !== false}
      BackgroundColor3={
        props.enabled === false ? Color3.fromRGB(48, 50, 55) : Color3.fromRGB(44, 67, 80)
      }
      TextColor3={props.enabled === false ? Color3.fromRGB(150, 150, 150) : gold}
      Font={Enum.Font.GothamMedium}
      TextSize={14}
      TextWrapped
      Text={props.text}
      Event={{
        Activated: () => {
          if (props.enabled !== false) props.action();
        },
      }}
    >
      <uicorner CornerRadius={new UDim(0, 6)} />
    </textbutton>
  );
}
function Label(props: { text: string; height?: number; order?: number }): React.Element {
  return (
    <textlabel
      LayoutOrder={props.order}
      Size={new UDim2(1, 0, 0, props.height ?? 32)}
      BackgroundTransparency={1}
      TextColor3={gold}
      TextSize={14}
      TextWrapped
      Text={props.text}
      Font={Enum.Font.Gotham}
    />
  );
}
function App(): React.Element {
  const [s, set] = useState<AdventureSnapshot>();
  const [panel, setPanel] = useState("");
  const [notice, setNotice] = useState("");
  const [viewport, setViewport] = useState(
    Workspace.CurrentCamera?.ViewportSize ?? new Vector2(1280, 720),
  );
  const [inputMode, setInputMode] = useState(UserInputService.PreferredInput);
  const touch = inputMode === Enum.PreferredInput.Touch;
  const gamepad = inputMode === Enum.PreferredInput.Gamepad;
  const compact = viewport.X < 900 || viewport.Y < 600;
  const panelWidth = math.min(340, viewport.X - 24);
  useEffect(() => {
    let sizeConnection: RBXScriptConnection | undefined;
    const attach = () => {
      sizeConnection?.Disconnect();
      const camera = Workspace.CurrentCamera;
      if (camera) {
        setViewport(camera.ViewportSize);
        sizeConnection = camera
          .GetPropertyChangedSignal("ViewportSize")
          .Connect(() => setViewport(camera.ViewportSize));
      }
    };
    attach();
    const cameraConnection = Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(attach);
    const modeConnection = UserInputService.GetPropertyChangedSignal("PreferredInput").Connect(() =>
      setInputMode(UserInputService.PreferredInput),
    );
    return () => {
      sizeConnection?.Disconnect();
      cameraConnection.Disconnect();
      modeConnection.Disconnect();
    };
  }, []);
  useEffect(() => {
    menuOpen = panel !== "";
    combatReady = s?.parent !== undefined && (s?.health ?? 0) > 0;
    equippedIndex = s ? math.max(0, WEAPONS.indexOf(s.equipped)) : 0;
  }, [panel, s?.parent, s?.health, s?.equipped]);
  useEffect(() => {
    setNotice(s?.message ?? "");
    let cancelled = false;
    task.delay(5, () => {
      if (!cancelled) setNotice("");
    });
    return () => {
      cancelled = true;
    };
  }, [s?.message]);
  useEffect(() => {
    const connection = event.OnClientEvent.Connect(
      (e: { kind: string; snapshot?: AdventureSnapshot; panel?: string }) => {
        if (e.kind === "Snapshot" && e.snapshot) set(e.snapshot);
        if (e.kind === "Open" && e.panel) setPanel(e.panel);
      },
    );
    // The server pushes state four times per second, including after loading completes.
    send({ kind: "Snapshot" });
    const menuAction = (_name: string, state: Enum.UserInputState, input: InputObject) => {
      if (UserInputService.GetFocusedTextBox()) return Enum.ContextActionResult.Pass;
      if (state !== Enum.UserInputState.Begin) return Enum.ContextActionResult.Sink;
      if (input.KeyCode === Enum.KeyCode.I || input.KeyCode === Enum.KeyCode.ButtonX)
        setPanel((p) => (p === "Inventory" ? "" : "Inventory"));
      else if (input.KeyCode === Enum.KeyCode.J || input.KeyCode === Enum.KeyCode.ButtonY)
        setPanel((p) => (p === "Journey" ? "" : "Journey"));
      else if (menuOpen) setPanel("");
      else return Enum.ContextActionResult.Pass;
      return Enum.ContextActionResult.Sink;
    };
    ContextActionService.BindAction(
      "EldoriaMenus",
      menuAction,
      false,
      Enum.KeyCode.I,
      Enum.KeyCode.J,
      Enum.KeyCode.ButtonX,
      Enum.KeyCode.ButtonY,
      Enum.KeyCode.ButtonB,
    );
    const keyboard = UserInputService.InputBegan.Connect((input) => {
      if (input.KeyCode === Enum.KeyCode.Escape) setPanel("");
    });
    return () => {
      connection.Disconnect();
      keyboard.Disconnect();
      ContextActionService.UnbindAction("EldoriaMenus");
    };
  }, []);
  if (!s)
    return (
      <textlabel
        Size={UDim2.fromScale(1, 1)}
        BackgroundColor3={ink}
        Text="ELDORIA • Loading your journey…"
        TextColor3={gold}
        TextSize={24}
      />
    );
  return (
    <>
      <textlabel
        key="AimReticle"
        Visible={s.parent !== undefined && panel === ""}
        AnchorPoint={new Vector2(0.5, 0.5)}
        Position={UDim2.fromOffset(viewport.X / 2, viewport.Y / 2 - GuiService.GetGuiInset()[0].Y)}
        Size={UDim2.fromOffset(20, 20)}
        BackgroundTransparency={1}
        Text="+"
        TextSize={22}
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextStrokeTransparency={0.3}
      />
      <frame
        key="Status"
        AnchorPoint={touch || viewport.X < 600 ? Vector2.zero : new Vector2(0, 1)}
        Position={
          touch || viewport.X < 600
            ? UDim2.fromOffset(12, viewport.X < 600 ? 48 : 8)
            : new UDim2(0, 12, 1, -12)
        }
        Size={UDim2.fromOffset(compact ? 220 : 250, 94)}
        BackgroundColor3={ink}
        BackgroundTransparency={0.1}
      >
        <uicorner />
        <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
        <uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
        <Label
          order={0}
          height={22}
          text={`${s.parent ?? "Unclaimed"} • Level ${s.level} • ${s.coins} coins`}
        />
        <Label
          order={1}
          height={20}
          text={`HP ${math.ceil(s.health)} / ${s.maxHealth}   •   XP ${s.xp}`}
        />
        <frame
          LayoutOrder={2}
          Size={new UDim2(1, 0, 0, 9)}
          BackgroundColor3={Color3.fromRGB(65, 40, 40)}
          BorderSizePixel={0}
        >
          <frame
            Size={UDim2.fromScale(s.health / math.max(1, s.maxHealth), 1)}
            BackgroundColor3={Color3.fromRGB(96, 191, 144)}
            BorderSizePixel={0}
          />
        </frame>
        <Label
          order={3}
          height={20}
          text={`Power ${math.floor(s.mana)}/60 • ${s.abilityCooldown > 0 ? `Ready in ${math.ceil(s.abilityCooldown)}s` : gamepad ? "Power ready [LT]" : touch ? "Power ready" : "Power ready [Q]"}`}
        />
        <Label
          order={4}
          height={20}
          text={`${s.equipped} +${s.upgrades[s.equipped]} • Potions ${s.inventory.Potion}${touch ? "" : gamepad ? " [↓]" : " [H]"}`}
        />
      </frame>
      <frame
        key="Tabs"
        AnchorPoint={new Vector2(1, 0)}
        Position={new UDim2(1, -12, 0, 8)}
        Size={UDim2.fromOffset(compact ? 220 : 260, 32)}
        BackgroundTransparency={1}
      >
        <uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 6)} />
        <Button
          name="Journey"
          text={gamepad ? "Journey [Y]" : touch ? "Journey" : "Journey [J]"}
          size={new UDim2(0.5, -3, 1, 0)}
          action={() => setPanel(panel === "Journey" ? "" : "Journey")}
        />
        <Button
          name="Inventory"
          text={gamepad ? "Inventory [X]" : touch ? "Inventory" : "Inventory [I]"}
          size={new UDim2(0.5, -3, 1, 0)}
          action={() => setPanel(panel === "Inventory" ? "" : "Inventory")}
        />
      </frame>
      {s.parent && panel === "" && !compact && (
        <frame
          key="Objective"
          AnchorPoint={new Vector2(0.5, 0)}
          Position={UDim2.fromScale(0.5, 0)}
          Size={UDim2.fromOffset(380, 56)}
          BackgroundTransparency={0.2}
          BackgroundColor3={ink}
        >
          <uilistlayout />
          <Label height={28} text={s.objective} />
          <Label height={28} text={s.navigation} />
        </frame>
      )}
      {panel !== "" && s.parent !== undefined && (
        <frame
          key="Panel"
          AnchorPoint={new Vector2(1, 0)}
          Position={new UDim2(1, -12, 0, 48)}
          Size={UDim2.fromOffset(panelWidth, math.max(180, math.min(500, viewport.Y - 170)))}
          BackgroundColor3={ink}
        >
          <uicorner />
          <textlabel
            Size={new UDim2(1, -90, 0, 38)}
            BackgroundTransparency={1}
            Text={panel}
            TextColor3={gold}
            TextSize={18}
            Font={Enum.Font.GothamMedium}
          />
          <frame
            AnchorPoint={new Vector2(1, 0)}
            Position={new UDim2(1, -6, 0, 4)}
            Size={UDim2.fromOffset(80, 30)}
            BackgroundTransparency={1}
          >
            <Button
              name="ClosePanel"
              text={gamepad ? "Close [B]" : "Close ×"}
              size={UDim2.fromScale(1, 1)}
              modal
              action={() => setPanel("")}
            />
          </frame>
          <scrollingframe
            key="PanelContents"
            Position={UDim2.fromOffset(0, 40)}
            Size={new UDim2(1, 0, 1, -40)}
            BackgroundTransparency={1}
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            CanvasSize={new UDim2()}
            ScrollBarThickness={5}
          >
            <uipadding
              PaddingLeft={new UDim(0, 10)}
              PaddingRight={new UDim(0, 10)}
              PaddingTop={new UDim(0, 8)}
              PaddingBottom={new UDim(0, 10)}
            />
            <uilistlayout Padding={new UDim(0, 6)} SortOrder={Enum.SortOrder.LayoutOrder} />
            {panel === "Journey" ? (
              <>
                <Label order={0} text={`REGION ${s.region + 1} • ${REGIONS[s.region].name}`} />
                <Label order={1} height={64} text={s.objective} />
                <Button
                  order={2}
                  name="Quest"
                  text={s.quests[s.region] === 0 ? "Accept quest" : "Claim quest reward"}
                  action={() => send({ kind: "Quest" })}
                />
                <Label order={3} height={50} text={s.navigation} />
                {REGIONS.map((r, i) => (
                  <Button
                    key={r.id}
                    order={10 + i}
                    name={`Travel${i}`}
                    text={`${i <= s.unlocked ? "Travel to" : "Locked:"} ${r.name}`}
                    enabled={i <= s.unlocked}
                    action={() => send({ kind: "Travel", region: i })}
                  />
                ))}
                <Button
                  order={20}
                  name="Return"
                  text="Return to camp (stand still for 3s)"
                  action={() => send({ kind: "Return" })}
                />
                <Button
                  order={21}
                  name="Save"
                  text="Save progress"
                  action={() => send({ kind: "Save" })}
                />
                <Label order={22} height={48} text={s.saveStatus} />
                <Label order={23} height={48} text={s.worldStatus} />
              </>
            ) : (
              <>
                <Label order={0} text="EQUIPMENT & INVENTORY" />
                {WEAPONS.map((w, i) => (
                  <Button
                    key={w}
                    order={i + 1}
                    name={`Equip${w}`}
                    text={`${s.equipped === w ? "Equipped:" : "Equip"} ${w} +${s.upgrades[w]} [${i + 1}]`}
                    enabled={s.inventory[w] > 0}
                    action={() => send({ kind: "Equip", item: w })}
                  />
                ))}
                <Label
                  order={5}
                  text={`Herbs ${s.inventory.Herb} • Ore ${s.inventory.Ore} • Potions ${s.inventory.Potion}`}
                />
                <Button
                  order={6}
                  name="Potion"
                  text="Drink potion • restore 60 HP [H]"
                  action={() => send({ kind: "Potion" })}
                />
                <Label
                  order={7}
                  text={
                    s.nearMerchant
                      ? "MERCHANT • Buy / sell one item"
                      : "Visit merchant at camp to trade"
                  }
                />
                {ITEMS.map((item, i) => (
                  <React.Fragment key={item}>
                    <Button
                      order={10 + i * 2}
                      name={`Buy${item}`}
                      text={`Buy ${item} • ${PRICES[item]} coins (own ${s.inventory[item]})`}
                      enabled={s.nearMerchant}
                      action={() => send({ kind: "Buy", item })}
                    />
                    <Button
                      order={11 + i * 2}
                      name={`Sell${item}`}
                      text={`Sell ${item} • +${SELL_PRICES[item]} coins`}
                      enabled={s.nearMerchant && s.inventory[item] > 0 && item !== s.equipped}
                      action={() => send({ kind: "Sell", item })}
                    />
                  </React.Fragment>
                ))}
                <Label
                  order={30}
                  text={s.nearForge ? "FORGE" : "Visit forge at camp to craft / upgrade"}
                />
                <Button
                  order={31}
                  name="Craft"
                  text="Craft potion • 2 herbs + 1 ore"
                  enabled={s.nearForge}
                  action={() => send({ kind: "Craft" })}
                />
                <Button
                  order={32}
                  name="Upgrade"
                  text={`Upgrade ${s.equipped} • ${25 * (s.upgrades[s.equipped] + 1)} coins + ${s.upgrades[s.equipped] + 1} ore`}
                  enabled={s.nearForge && s.upgrades[s.equipped] < 5}
                  action={() => send({ kind: "Upgrade" })}
                />
              </>
            )}
          </scrollingframe>
        </frame>
      )}
      {s.parent !== undefined && panel === "" && (
        <frame
          key="Hotbar"
          AnchorPoint={new Vector2(0.5, 1)}
          Position={new UDim2(0.5, compact && !touch && viewport.X >= 600 ? 105 : 0, 1, -12)}
          Size={UDim2.fromOffset(compact ? 234 : 300, 38)}
          BackgroundTransparency={1}
        >
          <uilistlayout
            FillDirection={Enum.FillDirection.Horizontal}
            Padding={new UDim(0, 6)}
            SortOrder={Enum.SortOrder.LayoutOrder}
          />
          {WEAPONS.map((w, i) => (
            <Button
              key={w}
              name={`Hotbar${w}`}
              order={i}
              text={`${s.equipped === w ? "• " : ""}${w}${touch || gamepad ? "" : ` [${i + 1}]`}`}
              size={new UDim2(1 / 3, -4, 1, 0)}
              enabled={s.inventory[w] > 0}
              action={() => send({ kind: "Equip", item: w })}
            />
          ))}
        </frame>
      )}
      {!touch && s.parent !== undefined && panel === "" && !compact && (
        <textlabel
          key="ControlHint"
          AnchorPoint={new Vector2(0.5, 1)}
          Position={new UDim2(0.5, 0, 1, -56)}
          Size={UDim2.fromOffset(540, 22)}
          BackgroundTransparency={1}
          TextColor3={gold}
          TextSize={12}
          Text={
            gamepad
              ? "RT attack · LT power · LB/RB equip · D-pad down potion"
              : "Click / R attack at crosshair · Q power · H potion · Right-drag camera"
          }
        />
      )}
      {touch && panel === "" && s.parent !== undefined && (
        <frame
          key="Actions"
          AnchorPoint={new Vector2(1, 1)}
          Position={new UDim2(1, -16, 1, -160)}
          Size={UDim2.fromOffset(112, 116)}
          BackgroundTransparency={1}
        >
          <uilistlayout Padding={new UDim(0, 4)} SortOrder={Enum.SortOrder.LayoutOrder} />
          <Button order={0} name="Attack" text="Attack" action={() => aim("Attack")} />
          <Button
            order={1}
            name="Ability"
            text={`Power • ${math.ceil(s.abilityCooldown)}s`}
            enabled={s.mana >= 20 && s.abilityCooldown <= 0}
            action={() => aim("Ability")}
          />
          <Button
            order={2}
            name="Heal"
            text={`Heal (${s.inventory.Potion})`}
            enabled={s.inventory.Potion > 0}
            action={() => send({ kind: "Potion" })}
          />
        </frame>
      )}
      {(notice !== "" || s.health <= 0) && s.parent !== undefined && (
        <textlabel
          key="Notice"
          AnchorPoint={new Vector2(0.5, 1)}
          Position={new UDim2(0.5, 0, 1, compact ? -64 : -88)}
          Size={UDim2.fromOffset(math.min(440, viewport.X - 24), 40)}
          BackgroundColor3={ink}
          BackgroundTransparency={0.15}
          Text={s.health <= 0 ? "You fell. Respawning at camp…" : notice}
          TextColor3={gold}
          TextSize={14}
          TextWrapped
        />
      )}
      {s.victory && (
        <textlabel
          key="Victory"
          Position={UDim2.fromScale(0.25, 0.2)}
          Size={UDim2.fromScale(0.5, 0.15)}
          BackgroundColor3={ink}
          Text="ELDORIA RESTORED\nFive sovereigns defeated. Your divine legacy begins."
          TextColor3={gold}
          TextSize={24}
          TextWrapped
        />
      )}
      {!s.parent && (
        <frame
          key="ParentSelection"
          Size={UDim2.fromScale(1, 1)}
          BackgroundColor3={ink}
          BackgroundTransparency={0.04}
          ZIndex={5}
        >
          <frame
            AnchorPoint={new Vector2(0.5, 0.5)}
            Position={UDim2.fromScale(0.5, 0.5)}
            Size={UDim2.fromOffset(math.min(600, viewport.X - 32), math.min(430, viewport.Y - 24))}
            BackgroundTransparency={1}
            ZIndex={6}
          >
            <uilistlayout Padding={new UDim(0, 14)} SortOrder={Enum.SortOrder.LayoutOrder} />
            <Label order={0} height={60} text="ELDORIA • CHOOSE YOUR DIVINE PARENT" />
            <Label
              order={1}
              height={56}
              text="Your choice is permanent for this save. Every demigod starts with a sword, trident, bow and three potions."
            />
            {PARENTS.map((p, i) => (
              <Button
                key={p}
                order={i + 2}
                name={`Choose${p}`}
                text={`${p} — ${p === "Poseidon" ? "Water surge: cone damage and 2s stun" : p === "Zeus" ? "Lightning strike: precise long-range damage" : "Shadow burst: nearby damage and self-healing"}`}
                action={() => send({ kind: "ChooseParent", parent: p })}
              />
            ))}
            <Label
              order={6}
              height={58}
              text="WASD move • Space jump • Right-drag camera • Click/R attack at crosshair • Q power • E interact • 1/2/3 equip • H potion"
            />
          </frame>
        </frame>
      )}
    </>
  );
}
const gui = new Instance("ScreenGui");
gui.Name = "DemigodHUD";
gui.ResetOnSpawn = false;
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
gui.Parent = player.WaitForChild("PlayerGui");
createRoot(gui).render(<App />);
pcall(() => StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false));
// Keep Roblox's normal movement/orbit controls; reattach its camera after respawn.
player.CameraMode = Enum.CameraMode.Classic;
player.CameraMinZoomDistance = 6;
player.CameraMaxZoomDistance = 24;
const attachCamera = (character: Model) => {
  const humanoid = character.WaitForChild("Humanoid") as Humanoid;
  if (player.Character !== character) return;
  const camera = Workspace.CurrentCamera;
  if (camera) {
    camera.CameraType = Enum.CameraType.Custom;
    camera.CameraSubject = humanoid;
  }
};
player.CharacterAdded.Connect(attachCamera);
if (player.Character) task.spawn(attachCamera, player.Character);
Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
  if (player.Character) task.spawn(attachCamera, player.Character);
});
const combatAction = (_name: string, state: Enum.UserInputState, input: InputObject) => {
  if (UserInputService.GetFocusedTextBox()) return Enum.ContextActionResult.Pass;
  if (menuOpen || !combatReady) return Enum.ContextActionResult.Sink;
  if (state !== Enum.UserInputState.Begin) return Enum.ContextActionResult.Sink;
  if (input.KeyCode === Enum.KeyCode.R || input.KeyCode === Enum.KeyCode.ButtonR2) aim("Attack");
  else if (input.KeyCode === Enum.KeyCode.Q || input.KeyCode === Enum.KeyCode.ButtonL2)
    aim("Ability");
  else if (input.KeyCode === Enum.KeyCode.H || input.KeyCode === Enum.KeyCode.DPadDown)
    send({ kind: "Potion" });
  else {
    const index =
      input.KeyCode === Enum.KeyCode.One
        ? 0
        : input.KeyCode === Enum.KeyCode.Two
          ? 1
          : input.KeyCode === Enum.KeyCode.Three
            ? 2
            : (equippedIndex + (input.KeyCode === Enum.KeyCode.ButtonR1 ? 1 : 2)) % 3;
    send({ kind: "Equip", item: WEAPONS[index] });
  }
  return Enum.ContextActionResult.Sink;
};
ContextActionService.BindAction(
  "EldoriaCombat",
  combatAction,
  false,
  Enum.KeyCode.R,
  Enum.KeyCode.Q,
  Enum.KeyCode.H,
  Enum.KeyCode.One,
  Enum.KeyCode.Two,
  Enum.KeyCode.Three,
  Enum.KeyCode.ButtonR2,
  Enum.KeyCode.ButtonL2,
  Enum.KeyCode.ButtonL1,
  Enum.KeyCode.ButtonR1,
  Enum.KeyCode.DPadDown,
);
UserInputService.InputBegan.Connect((input, processed) => {
  if (!processed && input.UserInputType === Enum.UserInputType.MouseButton1) aim("Attack");
});
// Nearby prompts provide the interaction text; distant duplicated labels obscure the scene.
const tuneLabel = (d: Instance) => {
  if (d.IsA("BillboardGui") && d.Name === "Beacon") {
    d.MaxDistance = 28;
    d.Size = UDim2.fromOffset(150, 24);
    d.AlwaysOnTop = false;
  }
  if (d.IsA("TextLabel") && d.Parent?.IsA("BillboardGui") && d.Parent.Name === "Beacon") {
    d.Text = d.Text.split("•")[0];
    d.TextSize = 13;
    d.TextWrapped = false;
    d.TextTruncate = Enum.TextTruncate.AtEnd;
  }
};
for (const d of Workspace.GetDescendants()) tuneLabel(d);
Workspace.DescendantAdded.Connect(tuneLabel);

event.OnClientEvent.Connect(
  (e: { kind: string; origin: Vector3; position: Vector3; effect: string; radius: number }) => {
    if (e.kind !== "Effect") return;
    const part = new Instance("Part");
    part.Name = "DivineEffect";
    part.Anchored = true;
    part.CanCollide = false;
    part.CanQuery = false;
    part.CanTouch = false;
    part.Material = Enum.Material.Neon;
    part.Color =
      e.effect === "Hades"
        ? Color3.fromRGB(162, 77, 236)
        : e.effect === "Zeus"
          ? Color3.fromRGB(255, 235, 128)
          : Color3.fromRGB(90, 208, 240);
    if (e.effect === "Hades" || e.effect === "Poseidon") {
      part.Shape = Enum.PartType.Ball;
      part.Size = new Vector3(1, 1, 1);
      part.Position = e.effect === "Hades" ? e.origin : e.origin.Lerp(e.position, 0.4);
      TweenService.Create(part, new TweenInfo(0.4), {
        Size: new Vector3(e.radius, 3, e.radius),
        Transparency: 1,
      }).Play();
    } else {
      const origin = e.effect === "Zeus" ? e.position.add(new Vector3(0, 35, 0)) : e.origin;
      const length = math.max(0.1, e.position.sub(origin).Magnitude);
      part.Size = new Vector3(0.22, 0.22, length);
      part.CFrame = CFrame.lookAt(origin, e.position).mul(new CFrame(0, 0, -length / 2));
      TweenService.Create(part, new TweenInfo(0.25), { Transparency: 1 }).Play();
    }
    part.Parent = Workspace;
    Debris.AddItem(part, 0.45);
  },
);
