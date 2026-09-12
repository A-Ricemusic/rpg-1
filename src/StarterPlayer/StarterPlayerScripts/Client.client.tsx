import React, { useEffect, useState } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import {
  Debris,
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
function aim(kind: "Attack" | "Ability"): void {
  const camera = Workspace.CurrentCamera;
  if (!camera) return;
  const root = player.Character?.FindFirstChild("HumanoidRootPart");
  if (!root?.IsA("BasePart")) return;
  const mouse = player.GetMouse();
  const delta = mouse.Hit.Position.sub(root.Position.add(new Vector3(0, 1, 0)));
  send({ kind, direction: delta.Magnitude > 0.1 ? delta.Unit : camera.CFrame.LookVector });
}
const gold = Color3.fromRGB(240, 205, 126);
const ink = Color3.fromRGB(16, 23, 34);
function Button(props: {
  name: string;
  text: string;
  action: () => void;
  order?: number;
  enabled?: boolean;
}): React.Element {
  return (
    <textbutton
      key={props.name}
      ref={(instance) => {
        if (instance) instance.Name = props.name;
      }}
      LayoutOrder={props.order}
      Size={new UDim2(1, 0, 0, 36)}
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
  const [panel, setPanel] = useState("Journey");
  useEffect(() => {
    const connection = event.OnClientEvent.Connect(
      (e: { kind: string; snapshot?: AdventureSnapshot; panel?: string }) => {
        if (e.kind === "Snapshot" && e.snapshot) set(e.snapshot);
        if (e.kind === "Open" && e.panel) setPanel(e.panel);
      },
    );
    let active = true;
    task.spawn(() => {
      while (active) {
        send({ kind: "Snapshot" });
        task.wait(2);
      }
    });
    const keyboard = UserInputService.InputBegan.Connect((input, processed) => {
      if (processed) return;
      if (input.KeyCode === Enum.KeyCode.I) setPanel((p) => (p === "Inventory" ? "" : "Inventory"));
      if (input.KeyCode === Enum.KeyCode.J) setPanel((p) => (p === "Journey" ? "" : "Journey"));
    });
    return () => {
      active = false;
      connection.Disconnect();
      keyboard.Disconnect();
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
      <frame
        key="Status"
        Position={UDim2.fromOffset(16, 48)}
        Size={UDim2.fromOffset(300, 146)}
        BackgroundColor3={ink}
        BackgroundTransparency={0.1}
      >
        <uicorner />
        <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
        <uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
        <Label
          order={0}
          text={`${s.parent ?? "Unclaimed"} • Level ${s.level} • ${s.coins} coins`}
        />
        <Label order={1} text={`Health ${math.ceil(s.health)} / ${s.maxHealth}   |   XP ${s.xp}`} />
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
          text={`Power ${math.floor(s.mana)}/60 • ${s.abilityCooldown > 0 ? `Ready in ${math.ceil(s.abilityCooldown)}s` : "Ability ready [Q]"}`}
        />
        <Label
          order={4}
          height={28}
          text={`${s.equipped} +${s.upgrades[s.equipped]} • Potions ${s.inventory.Potion} [H]`}
        />
      </frame>
      <frame
        key="Tabs"
        Position={new UDim2(1, -318, 0, 48)}
        Size={UDim2.fromOffset(300, 80)}
        BackgroundTransparency={1}
      >
        <uilistlayout Padding={new UDim(0, 4)} />
        <Button
          name="Journey"
          text="Journey & travel [J]"
          action={() => setPanel(panel === "Journey" ? "" : "Journey")}
        />
        <Button
          name="Inventory"
          text="Inventory, shop & forge [I]"
          action={() => setPanel(panel === "Inventory" ? "" : "Inventory")}
        />
      </frame>
      {panel !== "" && (
        <scrollingframe
          key="Panel"
          Position={new UDim2(1, -338, 0, 136)}
          Size={new UDim2(0, 320, 1, -260)}
          BackgroundColor3={ink}
          BackgroundTransparency={0.05}
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
              <Label
                order={3}
                height={50}
                text="Gold beacons: Oracle, merchant, forge, resources and boss. Camp is a safe zone."
              />
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
      )}
      <frame
        key="Actions"
        AnchorPoint={new Vector2(0.5, 1)}
        Position={UDim2.fromScale(0.5, 0.985)}
        Size={UDim2.fromOffset(290, 80)}
        BackgroundTransparency={1}
      >
        <uilistlayout Padding={new UDim(0, 4)} />
        <Button
          name="Attack"
          text="Attack [Click / R] • Aim with cursor"
          action={() => aim("Attack")}
        />
        <Button
          name="Ability"
          text={`${s.parent === "Poseidon" ? "Water surge" : s.parent === "Zeus" ? "Lightning strike" : "Shadow burst"} [Q] • 20 power`}
          action={() => aim("Ability")}
        />
      </frame>
      <textlabel
        key="Notice"
        AnchorPoint={new Vector2(0.5, 1)}
        Position={UDim2.fromScale(0.5, 0.86)}
        Size={UDim2.fromScale(0.48, 0.09)}
        BackgroundColor3={ink}
        BackgroundTransparency={0.15}
        Text={s.health <= 0 ? "You fell. Respawning at camp…" : s.message}
        TextColor3={gold}
        TextSize={16}
        TextWrapped
      />
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
            Size={UDim2.fromScale(0.7, 0.65)}
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
              text="WASD move • Space jump • Click/R attack • Q divine power • E interact • 1/2/3 equip • H potion"
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
UserInputService.InputBegan.Connect((input, processed) => {
  if (processed) return;
  if (input.UserInputType === Enum.UserInputType.MouseButton1 || input.KeyCode === Enum.KeyCode.R)
    aim("Attack");
  else if (input.KeyCode === Enum.KeyCode.Q) aim("Ability");
  else if (input.KeyCode === Enum.KeyCode.H) send({ kind: "Potion" });
  else if (input.KeyCode === Enum.KeyCode.One) send({ kind: "Equip", item: "Sword" });
  else if (input.KeyCode === Enum.KeyCode.Two) send({ kind: "Equip", item: "Trident" });
  else if (input.KeyCode === Enum.KeyCode.Three) send({ kind: "Equip", item: "Bow" });
});
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
