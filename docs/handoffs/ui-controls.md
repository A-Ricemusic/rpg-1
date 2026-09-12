# HUD, menus, camera and controls — September 12

The user explicitly authorized gameplay UI/control script edits after the original art-only restriction. This pass changes `src/StarterPlayer/StarterPlayerScripts/Client.client.tsx`; pre-existing server/gameplay changes remain with their owner. The client is compiled and synced through the existing Rojo connection.

## Behavior

- Journey and Inventory start closed. Compact tabs toggle them; each menu has a visible Close button. I/J toggle their respective menus, and Escape dismisses the custom panel while retaining Roblox's own menu behavior. Tab remains a Roblox core control.
- Desktop HUD: 250 × 94 status panel (220 wide at compact sizes), 300 × 38 equipment bar, small objective/navigation strip, and brief notices. Notices expire after five seconds; death messaging remains visible during respawn.
- Attack/power/heal buttons appear only for preferred touch input. Desktop receives a compact control hint. Width and height changes update layout; narrow layouts place status below the tabs and keep the hotbar centered.
- All attacks and powers aim through the center of the camera. The visible crosshair accounts for Roblox's top-bar inset so it matches that ray. It hides while browsing menus and before choosing a parent.
- Combat and equipment hotkeys are blocked while menus are open, before parent selection, when dead, or while a textbox has focus. UI clicks do not attack the world.
- Normal Roblox Classic third-person camera and movement remain in use. CameraSubject and Custom camera mode are restored on CharacterAdded or camera replacement. Zoom range is 6–24 studs. No continuous camera override or forced mouse lock was added.
- Interaction Beacon labels show the short name at 13px within 28 studs and do not show through geometry. Native proximity prompts provide action details when close. Enemy health labels are unchanged.

## Controls

Keyboard/mouse: WASD movement, Space jump, right-drag orbit, mouse wheel zoom, Click/R attack at crosshair, Q power, H potion, 1/2/3 equipment, I inventory, J journey, E native interaction.

Controller bindings: RT attack, LT power, LB/RB cycle equipment, D-pad down potion, X inventory, Y journey, B close custom menu. Native movement/jump/camera remain Roblox-controlled. Touch uses native movement/camera/jump plus custom action buttons and the equipment bar.

## Verification

Actual connected Studio Play sessions, using input tools rather than directly invoking action handlers:

- Chose Hades through the normal selection button. Menus began closed; Status was 250 × 94, tabs 260 × 32, and hotbar 300 × 38 in the measured desktop viewport.
- J opened Journey with a Close button and hid the reticle.
- Q and 2 with Journey open kept power at 60 and Sword equipped.
- Clicking Close, then 3/Q/W equipped Bow, consumed power and moved approximately 13 studs.
- A notice expired without being re-shown by the four-per-second snapshots.
- Reticle screen center equaled camera viewport center exactly after accounting for GuiInset.
- With a temporary textbox focused, Q/2 produced no additional Ability or Equip requests. After removing the textbox, one normal world click produced one Attack request. The temporary server observer only counted requests; it did not change gameplay handling, and was removed.
- After a controlled death/reset, health returned to 100 and CameraSubject equaled the respawned character's Humanoid, CameraType was Custom, and zoom limits remained 6/24.
- Formatting, roblox-ts typecheck, lint, and all 31 existing Bun tests passed (469 assertions).

Limits: Studio's virtual input refuses reserved Tab/B keys and did not produce measurable right-drag camera rotation. Controller X opened a panel, but the tool did not change PreferredInput to gamepad. Physical controller, touch, mouse-orbit feel and small-device visual ergonomics still need device testing. Play screenshot capture returned a blank magenta frame, so no screenshot is presented as visual proof of the HUD. Validation uses actual GUI properties, normal input and observed server requests.

Play was stopped, temporary fixtures removed, and the exclusive lock released. No test scripts or test hooks were added to gameplay source.

## Asset loading remains separate

The imported `Workspace.Eldoria-import-library` model was absent at inspection. The earlier object-backed meshes still fail to load in Play. This UI work does not repair them. Follow `assets/eldoria/import-ready/README.md` to import the prepared FBX through Studio's authenticated importer, then adopt and verify the actual client meshes. Save As alone does not repair missing mesh content.

API references consulted: [ContextActionService](https://create.roblox.com/docs/reference/engine/classes/ContextActionService), [UserInputService](https://create.roblox.com/docs/reference/engine/classes/UserInputService).
