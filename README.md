# rpg-game-1

Roblox Studio project managed with Rojo.

## Setup

Install Rojo, then start the local sync server from this directory:

```sh
rojo serve default.project.json
```

In Roblox Studio, install/open the Rojo plugin and connect to:

```text
localhost:34872
```

If you use Aftman for tool management:

```sh
aftman install
rojo serve default.project.json
```

## Project Layout

- `src/ReplicatedStorage` shared modules and assets
- `src/ServerScriptService` server-only scripts
- `src/StarterPlayer/StarterPlayerScripts` client scripts
- `src/StarterGui` UI instances and client UI scripts
- `src/Workspace` workspace instances
# rpg-1
