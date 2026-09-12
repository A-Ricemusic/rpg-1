# Gameplay verification procedure

Run `bun run format`, `bun run typecheck`, `bun run lint`, and `bun run test` from the checkout. Typecheck also generates Rojo's `out` tree. Keep the existing Rojo server; do not start another. `default.project.json` must preserve unknown Workspace instances and ReplicatedStorage assets.

## Exclusive Studio sessions

1. Atomically create `.agent-studio-lock` with `mkdir` in this checkout. If it exists, continue local work. Never delete or overwrite another owner's lock, even if it appears old. Write your role and a unique session identifier to its `owner` file immediately after successful creation.
2. List Studio instances and verify the active place and `Workspace.EldoriaWorld` before editing or starting Play. Record the place IDs, world layout, start time and a stop deadline less than ten minutes away. Leave time for the Stop command itself; start cleanup at nine minutes.
3. All Studio calls, including read-only calls, require ownership. Use actual mouse, keyboard and proximity actions for player-journey assertions. State reads verify outcomes; direct remote injection tests request validation only. Positioning or aiming helpers are test assistance and must be recorded.
4. Stop Play, verify Edit mode, then remove only your own owner file and lock directory. Do not release while Play is running. If Stop fails, keep ownership and retry; elapsed time does not make another owner's lock safe to remove.
5. Wait at least thirty seconds before attempting another session. Do not leave a background playtest or camera callback behind. A wall-clock deadline is a manual operational limit, not an automatic Studio watchdog.

The lock must not be committed: a checked-in lock can falsely reserve Studio on a fresh checkout. Failed runs do not justify clearing someone else's lock.

## Player journey checklist

| Area              | Action and observable result                                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World integration | Five named regions and their camp, forge, merchant, quest, resource, enemy and boss markers resolve. Runtime has twenty regular enemies and five bosses. Weapon Tools have a usable Handle. Authored geometry/assets survive Stop. No duplicate prototype/test world with Eldoria present. |
| First entry       | Spawn on the camp floor, choose each parent in separate fresh sessions, see correct equipment and HUD. A second selection cannot change the parent.                                                                                                                                        |
| Combat            | Equip 1/2/3 and damage a live target with Click/R and the Attack button. Test Q and the Ability button, range, cooldown, mana, obstruction and boss quest gating. Verify enemy HP, hit notices and kill rewards.                                                                           |
| Economy           | Accept quest; gather three resources using E; kill two enemies; claim once for XP/coins. Buy and sell with earned coins near merchant. Craft with two herbs/one ore and upgrade at forge. Insufficient funds/resources and remote-distance attempts change nothing.                        |
| Campaign          | Defeat each boss through normal inputs, claim reward, travel to the next camp. Locked travel fails. Final claim shows victory. Record each boss separately; a pure campaign unit test does not prove a live boss encounter.                                                                |
| Recovery          | Take damage, use potion, die, respawn at current camp with progress/equipment retained. Return succeeds while stationary during regeneration; damage, death and movement interrupt it.                                                                                                     |
| Persistence       | Confirm accurate save status. In an already configured published test place, save, leave/rejoin and compare parent/economy/equipment/quests. Test concurrent session ownership separately. Unpublished session state and serialization tests do not prove Roblox DataStore operation.      |
| Cleanup           | Inspect gameplay logs, Stop, confirm authored content remains, remove owned runtime fixtures, release owned lock, record elapsed time and next eligible start.                                                                                                                             |

For each run record: world revision, start/stop timestamps, inputs, before/after state, failures and fixes, assistance/fixtures, and untested cases. Prior coverage does not establish that newly moved geometry is navigable. Never describe seeded boss flags or directly changed health as a normal campaign pass.

Allow React layout to settle after scrolling/opening a panel, and confirm a click changed the expected snapshot before proceeding. The Studio input tool can return Success even when a button did not activate. Close Journey/Inventory for ordinary cursor attacks if they cover the target. Navigation helpers can stall when the character dies: bound each movement call, cancel the orchestration on a stall, and stop that Play session to clear pending navigation. Reattach a test camera to the new Humanoid after respawn.

Current automated tests include seven legacy prototype progression tests; those are not evidence for the active five-region campaign. Active tests cover the campaign/economy, roster, combat targeting, save validation and lease transitions, and camp-return cancellation. Multiplayer, device ergonomics, screenshots and real persistence need their own evidence.
