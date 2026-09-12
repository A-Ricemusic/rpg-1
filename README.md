# Eldoria demigod RPG

TypeScript, Roblox React function components, Bun, and Rojo.

Use the existing authored Studio place and the existing Rojo server for this checkout. Run `bun run typecheck`, then press Play in Studio. Choose your divine parent and accept the first quest in the Journey panel.

- **1/2/3** equip sword/trident/bow; **click/R** attack; **Q** divine power.
- **E** interact; **H** potion; **J** quests/travel; **I** inventory/shop/forge.
- Gather, defeat enemies, claim rewards, then defeat each boss to unlock five sequential regions and final victory.

[Full play instructions, verification and limitations](docs/handoffs/gameplay.md) · [World and asset handoff](docs/handoffs/world.md)

```sh
bun run format
bun run typecheck
bun run lint
bun run test
```

The unpublished Studio place uses session-only player progress. Preserve the authored place with Studio's Save to File before closing; Rojo preserves `EldoriaWorld` and `GameAssets` but does not save them to this checkout.
