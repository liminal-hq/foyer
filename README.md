# Foyer

**Glance, don't drown.** Foyer is a phone-first, local-first triage surface that pulls SMS/MMS/RCS, email, and app notifications into one calm, pre-digested view — built for brains that get overwhelmed processing messages one at a time.

It is **not** another notification stream. Foyer never pings you. It is a place you *go to*, on your terms, that has already done the triage for you.

## The idea in one breath

The phone isn't the problem; the *interaction contract* is — unbounded lists, interrupting pings, a decision per item, and dread proportional to uncertainty. Foyer inverts all of that: bounded, pull-only, pre-triaged, low-fidelity, with a "later" you can trust.

## Two surfaces, one app

- **The Sill** — a home-screen widget. Ambient weather for your messages: _"quiet · 2 worth a look · nothing on fire."_ No unread counts, no red badge. You glance without opening anything.
- **The Foyer** — the screen you open when you choose to process. A bounded, pre-triaged view: **Waiting on you** → **Worth a look** → **Can wait** → **Noise**. Reaching the bottom is the "you're caught up" state.

## How it works (at a glance)

- A Kotlin **notification-listener** Tauri plugin is the universal sensor: every notification (SMS, RCS, WhatsApp, email apps, dating apps) flows through one pipe.
- SMS/MMS are also read from the Telephony provider for history; email is pulled directly via IMAP/Gmail.
- A small **on-device** model does always-on triage and classification — private, cheap, no heat.
- Your **Claude API key** is used only when you *tap* an item for a deep summary, thread context, or a draft reply (RAG over local files). Nothing leaves the phone unless you pull it.

## Getting started

Foyer builds and runs inside the **shared Liminal HQ Android container** — no local Android SDK required. Open the repo in the devcontainer (`.devcontainer/devcontainer.json`, image `ghcr.io/liminal-hq/tauri-dev-mobile`), which installs Bun and dependencies on create.

```bash
bun install            # if not already done by the devcontainer
bun run dev:desktop    # Tauri desktop dev
bun run dev:android    # Tauri Android dev
bun run test           # JS/TS + (in CI) Rust tests
```

See [docs/architecture/build-and-ci.md](docs/architecture/build-and-ci.md) for the full toolchain and CI model.

## Status

Scaffolded (Bun + Tauri v2 monorepo, capture plugin, calm Foyer screen, tests, CI). The capture → triage → persist pipeline and the Sill widget are next; see [TODO.md](TODO.md). Key docs:

- [SPEC.md](SPEC.md) — task & specification document
- [docs/design/calm-contract.md](docs/design/calm-contract.md) — why Foyer is shaped the way it is
- [docs/README.md](docs/README.md) — documentation index
- [AGENTS.md](AGENTS.md) — contributor & agent conventions

## Stack

- **Frontend:** React + TypeScript + MUI (Material-UI v7), Material You theming
- **Host:** Rust (Tauri v2)
- **Mobile native:** Kotlin (custom Tauri plugins)
- **Persistence:** SQLite (`tauri-plugin-sql`)
- **Intelligence:** On-device small model (triage) + Claude API (on-demand depth/RAG)
- **Tooling:** Bun workspaces; builds run in the shared Liminal HQ Android container

## Privacy

Local-first. No analytics. Message content stays on device unless you explicitly tap for cloud-assisted depth, and you control what may be sent. Canadian English throughout.

---

Part of [Liminal HQ](https://liminalhq.ca) — local-first apps, privacy, calm computing.
