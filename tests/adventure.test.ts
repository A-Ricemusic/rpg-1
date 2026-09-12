import { describe, expect, test } from "bun:test";
import {
  claimQuest,
  freshAdventure,
  levelForXp,
  transact,
} from "../src/ReplicatedStorage/Shared/Adventure";
describe("demigod campaign", () => {
  test("cannot skip quests, duplicate rewards, or unlock regions without bosses", () => {
    const s = freshAdventure();
    claimQuest(s);
    claimQuest(s);
    expect(s.coins).toBe(0);
    expect(s.unlocked).toBe(0);
    s.gathered[0] = 3;
    s.kills[0] = 2;
    claimQuest(s);
    expect(s.coins).toBe(60);
    claimQuest(s);
    expect(s.coins).toBe(60);
    expect(s.unlocked).toBe(0);
    s.bosses[0] = true;
    claimQuest(s);
    expect(s.unlocked).toBe(1);
    const coins = s.coins;
    claimQuest(s);
    expect(s.coins).toBe(coins);
  });
  test("five sequential quest and boss rewards lead to victory", () => {
    const s = freshAdventure();
    for (let r = 0; r < 5; r++) {
      expect(s.unlocked).toBe(r);
      s.region = r;
      claimQuest(s);
      s.gathered[r] = 3;
      s.kills[r] = 2;
      claimQuest(s);
      expect(s.victory).toBe(false);
      s.bosses[r] = true;
      claimQuest(s);
    }
    expect(s.victory).toBe(true);
    expect(s.coins).toBe(900);
    expect(s.xp).toBe(1600);
    expect(levelForXp(s.xp)).toBeGreaterThan(1);
  });
  test("trading cannot mint coins or sell equipped / absent items", () => {
    const s = freshAdventure();
    transact(s, "Buy", "Ore");
    expect(s.inventory.Ore).toBe(0);
    transact(s, "Sell", "Sword");
    expect(s.inventory.Sword).toBe(1);
    transact(s, "Sell", "Ore");
    expect(s.coins).toBe(0);
    s.coins = 100;
    transact(s, "Buy", "Ore");
    transact(s, "Sell", "Ore");
    expect(s.coins).toBe(95);
  });
  test("crafting and upgrade costs are atomic and upgrades capped", () => {
    const s = freshAdventure();
    s.inventory.Herb = 2;
    transact(s, "Craft", "Potion");
    expect(s.inventory.Herb).toBe(2);
    s.inventory.Ore = 1;
    transact(s, "Craft", "Potion");
    expect(s.inventory.Potion).toBe(4);
    expect(s.inventory.Herb).toBe(0);
    s.coins = 1000;
    s.inventory.Ore = 100;
    for (let i = 0; i < 6; i++) transact(s, "Upgrade", "Sword");
    expect(s.upgrades.Sword).toBe(5);
    expect(s.coins).toBe(625);
    expect(s.inventory.Ore).toBe(85);
  });
});
