# Build & CI

Foyer is built and run through the **shared Liminal HQ container images** — there is no local Android SDK or Java install on the developer's machine. This mirrors Threshold.

## Toolchain

- **Package manager / runner:** Bun (`bun install`, `bun run …`). Workspaces live in the root `package.json`.
- **Host backend:** Rust (stable), provided by the container.
- **Mobile native:** Android SDK + JDK, provided by the container.

## Shared images

Published from `liminal-hq/.github` (`docker/ci/Dockerfile`):

| Image | Use |
|-------|-----|
| `ghcr.io/liminal-hq/tauri-ci-mobile` | Android/mobile **CI** jobs (this repo's `test.yml`) |
| `ghcr.io/liminal-hq/tauri-dev-mobile` | The **devcontainer** for interactive local dev |
| `ghcr.io/liminal-hq/tauri-ci-desktop` | Desktop CI (multi-arch) |
| `ghcr.io/liminal-hq/tauri-dev-desktop` | Desktop devcontainer |

These ship `cargo`, `rustup`, `node`, `pnpm`, `cargo-tauri`, `gh`, and (on mobile) the Android SDK under `/opt/android-sdk` (CI) or `$HOME/Android/Sdk` (dev). **Bun is not baked in**, so we install it per-environment (a devcontainer `postCreateCommand` and a CI step).

## Local development

Open the repo in the devcontainer (`.devcontainer/devcontainer.json` → `tauri-dev-mobile`). On create it installs Bun and runs `bun install`. Then:

```bash
bun run dev:desktop     # Tauri desktop dev
bun run dev:android     # Tauri Android dev (device/emulator via the container)
```

Do **not** install the Android SDK on the host — the container owns it.

## CI

`.github/workflows/test.yml` runs on every push to `main` and every PR, **inside** `tauri-ci-mobile`:

- **JS/TS tests** — `bun install`, build `@foyer/core`, then `bun run --filter '*' test` (Vitest).
- **Rust tests** — `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test --workspace`.

Tests are a required gate; see [AGENTS.md](../../AGENTS.md) → The Calm Contract for what must never regress.

### Not yet wired

- **Kotlin unit tests** need the Tauri-generated `tauri-android` Gradle module (produced by `tauri android init`), so a plugin-level Gradle test job is deferred until the Android project is generated in CI. Tracked in [TODO.md](../../TODO.md).
- **Release/signing** workflow (keystore mount, Play Console) — deferred to v1 hardening.
