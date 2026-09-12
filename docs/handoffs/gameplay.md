# Demigod adventure: play and verification

## Play in Studio

Keep the current authored place open. It must contain `Workspace.EldoriaWorld` and `ReplicatedStorage.GameAssets`. Use the existing Rojo server for this checkout on port 34872. Run `bun run typecheck` after editing TypeScript; the connected Rojo plugin syncs `out`. Press **Play**.

Choose **Poseidon**, **Zeus**, or **Hades**. The choice is permanent for that player save. Every new player starts with a sword, trident, bow, and three healing potions. The initial camp is in Whispering Wilds.

| Control                         | Action                                                               |
| ------------------------------- | -------------------------------------------------------------------- |
| WASD / Space                    | Move / jump                                                          |
| 1 / 2 / 3                       | Equip sword / trident / bow                                          |
| Mouse cursor + left click, or R | Aim and attack                                                       |
| Q                               | Divine power: 20 mana, six-second cooldown                           |
| E (brief hold)                  | Interact with nearby resources, Oracle, merchant, or forge           |
| H                               | Use a potion: restore up to 60 HP, two-second cooldown               |
| J                               | Journey, quest rewards, regional travel, return to camp, save status |
| I                               | Inventory, equipment, merchant buy/sell, crafting and upgrades       |

Poseidon's surge damages a forward cone and stuns enemies for two seconds. Zeus's lightning is a precise long-range strike. Hades's burst hits nearby enemies in every direction and restores up to 15 HP. Mana regenerates. Sword attacks have a broad short reach; tridents reach farther; bows use a server raycast. Scenery blocks attacks. Aim at the enemy's body, not its overhead nameplate.

## Complete the campaign

1. Accept the region's quest in **Journey** or at the Oracle.
2. Gather three resources and defeat two regular enemies. Gathering nodes regrow for each player after eight seconds. Use the Journey panel’s live distance and compass directions to find the nearest resource, enemy, or boss. North is world -Z; the facing indicator follows your character. Nearby gold beacons identify interactions. The expanded world no longer uses the old north/south row layout.
3. Click **Claim quest reward**: earn 60 coins and 120 XP. This enables the regional boss objective.
4. Defeat the boss, then claim again for another 120 coins and 200 XP, plus the boss's own combat rewards. Travel from camp to the newly unlocked region. Walking across an unlocked region boundary also changes your active region.
5. Complete Whispering Wilds → Emberfall Caldera → Frostveil Reach → Zephyr Mesa → Umbral Hollow. Claim the final boss quest to display **ELDORIA RESTORED**.

Bosses have different attacks: Elder Briar summons a projectile spread; Pyre Tyrant emits a delayed close-range nova; Frostveil Colossus targets ground spikes; Skybreaker fires volleys; the Null Sovereign combines summoned projectiles with ground spikes when enraged. Enrage begins below half health. Watch their health labels and move away from attack warnings. Health and weapon damage grow with levels.

Camp protects players while shopping and crafting. At a merchant, open Inventory to buy or sell individual items for earned coins. Selling the equipped weapon is blocked. Wood and crystals are useful trade goods. The first region has no native ore node: buy ore there or gather it in later regions. At a forge, two herbs plus one ore make a potion. Weapon upgrades add 10 damage per rank, up to +5; each rank costs 25 × next rank coins and next rank ore. Upgrade before the later bosses and carry potions.

Death keeps parent, inventory, coins, XP, quest progress, and unlocked regions. Respawn restores health and mana at the current camp and re-equips the weapon. **Return to camp** takes three seconds without moving or taking damage; travel buttons require being at camp.

## World ownership and animation contract

Gameplay reads the actual markers described in [world.md](world.md): `MerchantLocation`, `QuestGiverLocation`, `BlacksmithLocation`, `EnemySpawn_01` through `_04`, `BossSpawn`, `Entrance`, `Exit`, and `MarkerType=Gathering` / `ResourceId`. Camp and forge fallback positions are relative to the authored region centers. Floor checks start near ground level so Umbral's roof is not selected as the floor.

`DemigodRuntime` contains live enemies and interaction anchors during Play. Authored enemy display copies are hidden only in the runtime copy of the world; stopping Play restores them. Environment geometry and all template folders are preserved. No prototype enemy layout is spawned. With no authored world, the separate runtime-only `DemigodTestContent` fallback supplies test platforms; it is not created when `EldoriaWorld` exists.

Weapons are cloned from the actual authored Tools, retaining direct `Handle` parts and their joints. Character visuals use exact enemy IDs from `GameAssets.Characters`; missing art falls back to simple runtime bodies. NPC interactions attach at the placed NPC markers. The initial blacksmith and later fallback forge anchors are usable. No animation IDs are fabricated or uploaded.

Future animations should use the rig joints and grip attachments documented in the art handoff. Preserve `Handle.RightGripAttachment`, `GripAttachment`, `TipAttachment`, and bow `ArrowNockAttachment`. The authored weapon axis is +Y; forward on characters is -Z. Current sword/trident procedural swing lasts 0.18 seconds, with server cooldowns 0.45/0.65 seconds; bow cooldown is 0.7 seconds. A future melee `Hit` marker should align with the authoritative attack instant, and `Recover` with the end of the visual swing. Bow `Release` should align with the server shot. Powers resolve immediately on accepted Q input; use `Cast` at time zero and recovery within 0.45 seconds. Animation events must never grant damage or bypass server cooldowns.

## Persistence and remaining limitations

`DemigodAdventure_v2` stores parent, economy, inventory, equipment ranks, XP, quests, region unlocks, and victory. The server validates loaded values, obtains a session lease through `UpdateAsync`, autosaves every 45 seconds, saves on explicit request/player leave/shutdown, and refuses to overwrite a save when loading fails. The old prototype's store is not overwritten.

The current place is unpublished (`PlaceId` / `GameId` 0). The HUD therefore reports **Session only: unpublished place**. Cross-session Roblox DataStore save/load could not be verified here. No publishing, API-key configuration, or settings changes were performed. A temporary Studio-only checkpoint preserved already-earned progress between bounded verification sessions; that fixture and its code hook were removed before delivery. It is not evidence of DataStore operation.

The art handoff also reports that a local `.rbxl` save has not been verified. Preserve the open authored place with Studio's **File → Save to File / Save As** before closing it; the TypeScript checkout and art sources do not by themselves constitute a saved copy of the entire Studio place.

## Earlier campaign verification (before the world expansion)

- Local: formatting, roblox-ts compilation/typecheck, lint, and 17 Bun tests covering campaign sequencing, duplicate rewards, economy transactions, upgrade limits, XP, and serialization/invalid save fields.
- Actual Studio input: parent selection; authored equipment; sword, trident and bow damage; Poseidon, Zeus and Hades powers (including Hades healing); gathering; quest acceptance/rewards/leveling; buying/selling; potion crafting; weapon upgrades through +5; potion use; enemy attacks; death and respawn with inventory retained; return to camp.
- All five bosses were defeated using normal attack/power inputs. All next-region unlocks and travel transitions were exercised. The final normal quest reward produced `victory=true`, five completed boss flags, and a visible Victory GUI.
- The first two regions were earned in a fresh session. Later bounded sessions resumed an exact copy of already-earned progress. No boss health reductions, granted currency, or unlocked-region cheats were used. Test tools positioned/aimed the camera and used navigation helpers; their camera needed reattaching after death.
- A live test caught and fixed the Umbral roof-spawn bug. A clean final-region restart spawned at ground level, and the final boss was then defeated inside the cavern.
- Studio screenshot capture returned a blank magenta frame in Play. Verification used actual mouse/keyboard/proximity input, server state, UI instances and logs; visual polish is not claimed as screenshot-verified. Tool/CoreGui warnings and an unrelated installed Atmos plugin message were distinguished from gameplay script failures.
- Clean fresh-start smoke test: Hades selection and authored sword equipment passed with no checkpoint fixture or hook. A second parent choice, a locked-region travel request, an invalid shop item and a NaN attack vector were rejected without gameplay errors. The Save button retained the accurate session-only status.
- Multiplayer session contention, platform-specific touch/gamepad ergonomics, and real DataStore service operation remain unverified.

Studio tests stop before ten minutes, release the exclusive filesystem lock, and wait at least thirty seconds before attempting another test. Each completed run returned to Edit mode with no gameplay-owned lock or verification fixture left behind.

## Combat correction — September 12

On-screen Attack and Ability buttons now aim through the center of the camera instead of the cursor position over the button. Normal Click/R/Q uses the cursor ray with the player character excluded. Sword/trident arcs use horizontal aim, preventing a downward cursor angle from directing the swing into the floor. Bow/lightning hits use the first server ray's visible body hit without a redundant center-of-body obstruction test. Misses and damage appear in the notice; boss quest restrictions retain their explanation.

Verified with actual Studio inputs against live authored enemy visuals: Sword 30 damage using the Attack button; Trident 38; Bow 28 using the button and a normal mouse click; Zeus's Ability button killed a 70-HP enemy. Gameplay logs contained no script failures; the installed plugin/tool messages were unrelated. Two targeting regression tests bring the local suite to 19 passing tests. Playtests were stopped and the gameplay lock released.

## Full-system audit — September 12, expanded world

The expanded radial layout was present in Place1 (PlaceId/GameId 0). Gameplay resolved all five centers, explicit camps/forges and gathering markers. All 90 checked spawn/location/gathering markers had a floor ray hit within 12 studs; twenty regular enemies and five bosses spawned at the new locations. This checks placement, not every route or obstacle. `GameAssets` retained 2,398 descendants before/after tests. The single existing Rojo server synced the new code while preserving authored content.

Corrections made during this audit:

- Snapshot requests have a separate rate limit, and the client no longer polls redundantly. Previously a background snapshot could discard an attack arriving in the same 60 ms window.
- Return-to-camp tracks damage and movement throughout the channel. Healing/regeneration no longer interrupts it; moving away and back, damage, death or character replacement cancels it permanently.
- Pending nova/spike/dash attacks check that the source is still alive. Dash also retains the original target character; spikes reject targets on distant vertical levels.
- Unsupported save envelopes are refused rather than overwritten with a fresh profile. Unlocks/victory are derived from sequential completed boss quests. A player leaving during load releases an acquired save lease. Real service operation remains unverified.
- Marker fallbacks respect authored `WorldCenter`. Journey displays objective distance/direction and camp direction for the expanded map.
- The tracked Studio lock is removed from project content and ignored. The [playtest procedure](../playtesting.md) records ownership, deadlines, input assertions, cleanup, and honest coverage requirements. There is no automatic Studio-stop watchdog.

### Sessions and fresh evidence

All times UTC on September 12. Lock acquisition preceded every Studio call; each run verified Place1, stopped Play, checked Edit mode, and released only its own lock. Start-to-release intervals include Stop and cleanup.

| Session               | Start    | Stop/lock release | Duration | Evidence                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | -------- | ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Poseidon          | 15:58:07 | 16:06:05          | 7m 58s   | New camp spawn; parent choice; three herb gathers; bow/trident attacks and water surge; two enemy kills; 60-coin/120-XP quest reward; merchant buys/sell; potion crafting; trident +1 upgrade; potion use; natural death/respawn; normal Elder Briar defeat; 120-coin/200-XP boss quest claim; unlock/travel to the relocated Ember camp. |
| 2 — Hades             | 16:07:47 | 16:10:13          | 2m 26s   | Fresh Hades; sword reduced Moss Brawler 85→55 HP; shadow burst killed it and healed the player; live objective directions; invalid parent change/locked travel/item/NaN attack rejected; return damage cancellation; dead-source boss telegraph regressions.                                                                              |
| 3 — Zeus, final build | 16:11:55 | 16:14:35          | 2m 40s   | Fresh Zeus; bow button and normal cursor click each dealt 28; lightning killed the target; same-frame Snapshot+Attack reduced target 42→14 HP; live five-boss AI patterns; dead dash-source regression; accurate session-only Save status.                                                                                                |

The gaps between sessions exceeded thirty seconds. Navigation used a 3× helper and camera aiming assistance. In session 1 a navigation operation stalled after death; its orchestration was cancelled and the run stopped before the deadline. Some initial UI clicks needed retrying after layout/focus settled; results were judged from state changes, not tool Success messages.

The first-region quest, purchases, equipment upgrade, boss defeat, rewards and Ember unlock were earned through normal inputs. No profile checkpoint hook or seed was installed in this audit. Controlled regression checks were separate: temporary `DemigodVerification` actors were positioned near a test player, player health was reset, and source health was explicitly set to zero during telegraphs. These verified nova/spike cancellation for Pyre/Frost/Null, dash cancellation, and return behavior with injected damage/regeneration. They are not boss victories or save/load tests.

All five isolated boss AI fixtures emitted their configured attacks and damaged the test player: Elder Briar summoned six projectiles; Pyre emitted a nova; Frost emitted a warning/spike; Skybreaker fired eight projectiles; enraged Null emitted thirteen projectiles plus a warning/spike. All source-death telegraph cases left the test player at 100 HP. Actual full health-to-zero campaign defeat on the expanded layout was freshly repeated for Elder Briar only; the four later full encounters and final-victory UI retain the earlier campaign evidence above, not a fresh expanded-map clear.

Final local checks: `bun run format`, `bun run typecheck`, `bun run lint`, and **28 passing Bun tests / 355 assertions**. Seven tests concern the legacy prototype; the others cover active campaign/economy, roster, targeting, navigation, save validation/lease transitions, return cancellation and the request race. Studio logs contained no gameplay script failures; CoreGui input warnings and the installed Atmos plugin message were unrelated.

Final Studio inspection: Edit mode; authored world and all 2,398 asset descendants retained; no `DemigodRuntime`, `DemigodTestContent` or `DemigodVerification` left in Edit; gameplay lock released. Remaining verification gaps: real DataStore save/rejoin and multiplayer lease contention, a fresh complete expanded-map campaign clear, device ergonomics/performance, and saved-place reopen durability. No publishing, API setup, animation uploads, or authored-environment replacement was performed.
