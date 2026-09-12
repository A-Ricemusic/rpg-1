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
2. Gather three resources and defeat two regular enemies. Gathering nodes regrow for each player after eight seconds. Follow the gold beacons; resources lie south of the main road, regular enemies north of it.
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

## Verification record

- Local: formatting, roblox-ts compilation/typecheck, lint, and 17 Bun tests covering campaign sequencing, duplicate rewards, economy transactions, upgrade limits, XP, and serialization/invalid save fields.
- Actual Studio input: parent selection; authored equipment; sword, trident and bow damage; Poseidon, Zeus and Hades powers (including Hades healing); gathering; quest acceptance/rewards/leveling; buying/selling; potion crafting; weapon upgrades through +5; potion use; enemy attacks; death and respawn with inventory retained; return to camp.
- All five bosses were defeated using normal attack/power inputs. All next-region unlocks and travel transitions were exercised. The final normal quest reward produced `victory=true`, five completed boss flags, and a visible Victory GUI.
- The first two regions were earned in a fresh session. Later bounded sessions resumed an exact copy of already-earned progress. No boss health reductions, granted currency, or unlocked-region cheats were used. Test tools positioned/aimed the camera and used navigation helpers; their camera needed reattaching after death.
- A live test caught and fixed the Umbral roof-spawn bug. A clean final-region restart spawned at ground level, and the final boss was then defeated inside the cavern.
- Studio screenshot capture returned a blank magenta frame in Play. Verification used actual mouse/keyboard/proximity input, server state, UI instances and logs; visual polish is not claimed as screenshot-verified. Tool/CoreGui warnings and an unrelated installed Atmos plugin message were distinguished from gameplay script failures.
- Clean fresh-start smoke test: Hades selection and authored sword equipment passed with no checkpoint fixture or hook. A second parent choice, a locked-region travel request, an invalid shop item and a NaN attack vector were rejected without gameplay errors. The Save button retained the accurate session-only status.
- Multiplayer session contention, platform-specific touch/gamepad ergonomics, and real DataStore service operation remain unverified.

Studio tests stop before ten minutes, release the exclusive filesystem lock, and wait at least thirty seconds before attempting another test. The final state is Edit mode with no gameplay-owned lock or verification fixture left behind.

## Combat correction — September 12

On-screen Attack and Ability buttons now aim through the center of the camera instead of the cursor position over the button. Normal Click/R/Q uses the cursor ray with the player character excluded. Sword/trident arcs use horizontal aim, preventing a downward cursor angle from directing the swing into the floor. Bow/lightning hits use the first server ray's visible body hit without a redundant center-of-body obstruction test. Misses and damage appear in the notice; boss quest restrictions retain their explanation.

Verified with actual Studio inputs against live authored enemy visuals: Sword 30 damage using the Attack button; Trident 38; Bow 28 using the button and a normal mouse click; Zeus's Ability button killed a 70-HP enemy. Gameplay logs contained no script failures; the installed plugin/tool messages were unrelated. Two targeting regression tests bring the local suite to 19 passing tests. Playtests were stopped and the gameplay lock released.
