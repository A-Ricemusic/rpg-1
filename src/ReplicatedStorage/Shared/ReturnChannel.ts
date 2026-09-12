export interface ReturnChannel {
  cancelled: boolean;
  lastHealth: number;
}
export function updateReturn(
  channel: ReturnChannel,
  health: number,
  distanceFromStart: number,
  sameCharacter: boolean,
): void {
  if (!sameCharacter || health <= 0 || health < channel.lastHealth || distanceFromStart > 4)
    channel.cancelled = true;
  channel.lastHealth = health;
}
