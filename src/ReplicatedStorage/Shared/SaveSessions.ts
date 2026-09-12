/** Ownership belongs to a player connection, not to the entire server process. */
export class SaveSessions<Owner> {
  private readonly tokens = new Map<Owner, string>();
  constructor(private readonly createToken: () => string) {}
  begin(owner: Owner): string {
    const existing = this.tokens.get(owner);
    if (existing !== undefined) return existing;
    const token = this.createToken();
    this.tokens.set(owner, token);
    return token;
  }
  get(owner: Owner): string | undefined {
    return this.tokens.get(owner);
  }
  end(owner: Owner, token: string): void {
    if (this.tokens.get(owner) === token) this.tokens.delete(owner);
  }
}
