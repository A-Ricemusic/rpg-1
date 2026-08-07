# rpg-game-1

Roblox Studio project managed with Rojo.

## Setup

Install the dependencies and compile the TypeScript sources before starting the Rojo sync server:

```sh
bun install
bun run build
rojo serve default.project.json
```

In Roblox Studio, install/open the Rojo plugin and connect to:

```text
localhost:34872
```

If you use Aftman for tool management:

```sh
aftman install
bun install
bun run build
rojo serve default.project.json
```

Use `bun run check` to verify formatting, types, lint rules, and tests before committing.

## Project Layout

- `src/ReplicatedStorage` shared modules and assets
- `src/ServerScriptService` server-only scripts
- `src/StarterPlayer/StarterPlayerScripts` client scripts
- `src/StarterGui` UI instances and client UI scripts
- `src/Workspace` workspace instances
