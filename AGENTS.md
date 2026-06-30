# AGENTS.md

Conventions for Foyer, following Liminal HQ house rules (shared with Threshold, Spindle, Flow).

## Table of Contents

- [The Calm Contract](#the-calm-contract)
- [Localization and Spelling](#localization-and-spelling)
- [Commit Messages](#commit-messages)
- [Pull Request Titles](#pull-request-titles)
- [Git Workflow](#git-workflow)
- [Code Organization](#code-organization)
- [Best Practices](#best-practices)
- [Plugin Development](#plugin-development)
- [UI Project Structure](#ui-project-structure)
- [Privacy & Intelligence](#privacy--intelligence)
- [Licence and Copyright](#licence-and-copyright)
- [Tauri v2](#tauri-v2)

## The Calm Contract

**REQUIREMENT:** Read [docs/design/calm-contract.md](docs/design/calm-contract.md) before proposing any feature. Two rules are non-negotiable and override convenience:

- **Foyer never emits a system notification.** There is no code path that posts to the Android notification system.
- **The Sill (widget) shows no numeric unread count and no badge.** Mood words only.

Any change that trips a tripwire in the calm-contract doc is rejected regardless of how useful it seems.

## Localization and Spelling

**REQUIREMENT:** All UI strings, code variables, comments, commit messages, PR descriptions, and documentation MUST use **Canadian English** spelling (`colour`, `centre`, `neighbour`, `cancelled`, `licence` (noun) / `license` (verb)).

## Commit Messages

**Format:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`). Use `test:` for test-only changes.

**Body:** explain what and why (not how); markdown with **bold labels**, not headings; reflect the specific change, not the whole project history.

**Shell safety:** for markdown-heavy bodies with backticks or `$()`, write the message to a file and use `git commit -F <file>`; verify with `git log -1 --pretty=fuller` and amend if interpolation altered content.

## Pull Request Titles

Human-readable summaries, starting with a capital letter, no Conventional Commit prefixes, describing the behaviour change. Keep title style consistent across a stack.

## Git Workflow

**REQUIREMENT:** Do not push (especially force pushes) unless explicitly requested.

## Code Organization

**Bun** workspace monorepo (the package manager and runner is `bun`, not `pnpm`/`npm`):

- `apps/` — the Tauri application.
- `packages/` — shared TypeScript logic.
- `plugins/` — custom Tauri plugins (Kotlin + Rust).
- `docs/` — documentation.

Workspaces are declared in the root `package.json` `workspaces` field. Use `bun install` and `bun run --filter <pkg> <script>`. In `tauri.conf.json`, before-commands must be `bun run dev` / `bun run build` (bare `bun build` invokes Bun's bundler, not the package script).

**Builds run in containers, not on the host.** Android and desktop builds use the shared Liminal HQ images (`ghcr.io/liminal-hq/tauri-ci-mobile` for CI, `tauri-dev-mobile` for the devcontainer). Do not assume or add a local Android SDK. See [docs/architecture/build-and-ci.md](docs/architecture/build-and-ci.md).

## Best Practices

- **NO BARREL FILES.** Import directly from the specific file, never from an `index.ts` re-export.
- **USE HELPERS.** Check for an existing utility (e.g. platform detection) before writing manual logic.

## Plugin Development

When creating or modifying Foyer plugins with Android support:

- Plugins MUST own their Android permissions via **build-time manifest injection** using `tauri_plugin::mobile::update_android_manifest()` in `build.rs`.
- Block identifier format: `tauri-plugin-{plugin-name}.permissions`.
- Inject permissions and declare service/component blocks in the plugin; never require users to hand-edit a shared manifest.
- Reference shape: Threshold's `plugins/alarm-manager`. Foyer's sensor plugin is specified in [docs/plugins/notification-listener.md](docs/plugins/notification-listener.md).

## UI Project Structure

- **`src/components/`** — reusable "dumb" components.
- **`src/screens/`** — full-page views (e.g. `Foyer.tsx`, `DeepView.tsx`, `Settings.tsx`).
- **`src/hooks/`** — custom React hooks.
- **`src/services/`** — business-logic singletons (e.g. `CaptureService`, `TriageService`).
- **`src/theme/`** — MUI theme + Material You integration.
- **`src/context/`** — React Context providers.

## Privacy & Intelligence

- **Local-first; default-deny on cloud egress.** Tier-1 triage runs on-device. The Claude API is invoked **only** when the user taps an item for depth, and only with content permitted by the user's allow rules. See [docs/architecture/intelligence-and-rag.md](docs/architecture/intelligence-and-rag.md).
- No analytics. No telemetry.

## Licence and Copyright

**REQUIREMENT:** All source files (Rust, Kotlin, TypeScript, etc.) MUST begin with:

```
// Brief one-line summary of what this file does
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT
```

First line is a concise one-sentence purpose (no period); place before any `package`/`use`/`import`/`mod`; one blank line before code. Do not add headers to generated files, config (`.toml`, `.json`, `.yml`), or documentation (`.md`).

## Tauri v2

This is a **Tauri v2** project with native Android support. Use `@tauri-apps/plugin-os` `platform()` for platform detection (synchronous, compile-time). Prefer Tauri plugins over web APIs. Grant permissions via the **capabilities** system in `src-tauri/capabilities/` — installing a plugin is not enough. Avoid Tauri v1 patterns (`tauri.allowlist`, `distDir`, `devPath`, `@tauri-apps/api/fs`, etc.).
