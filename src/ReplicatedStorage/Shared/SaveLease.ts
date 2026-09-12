import { AdventureSave } from "./Adventure";
import { sanitize } from "./AdventureValidation";
export interface SaveEnvelope {
  data: AdventureSave;
  session: string;
  expires: number;
}
/** A nil result cancels UpdateAsync; never turn an unsupported save into a fresh profile. */
export function acquireSave(old: unknown, session: string, now: number): SaveEnvelope | undefined {
  if (old === undefined) return { data: sanitize(undefined), session, expires: now + 180 };
  if (!typeIs(old, "table")) return undefined;
  const raw = old as { data?: unknown; session?: unknown; expires?: unknown };
  if (!typeIs(raw.data, "table") || (raw.data as { version?: unknown }).version !== 2)
    return undefined;
  if (
    typeIs(raw.session, "string") &&
    raw.session !== session &&
    typeIs(raw.expires, "number") &&
    raw.expires > now
  )
    return undefined;
  return { data: sanitize(raw.data), session, expires: now + 180 };
}
export function writeSave(
  old: unknown,
  data: AdventureSave,
  session: string,
  now: number,
  release: boolean,
): SaveEnvelope | undefined {
  if (!typeIs(old, "table") || (old as { session?: unknown }).session !== session) return undefined;
  return {
    data: sanitize(data),
    session: release ? "" : session,
    expires: release ? 0 : now + 180,
  };
}
