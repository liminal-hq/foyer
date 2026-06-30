# Architecture

Foyer is a Tauri v2 monorepo (Bun workspaces), phone-first, local-first, following Liminal HQ conventions (see [../../AGENTS.md](../../AGENTS.md)). It builds and runs through the shared Liminal HQ Android container images, not a local Android toolchain (see [build-and-ci.md](build-and-ci.md)).

## Components

| Layer | Responsibility |
|-------|----------------|
| `apps/foyer` (React + MUI) | The Foyer screen and settings; renders the four buckets, deep view, Done/Later/Mute. |
| `apps/foyer` (Rust host) | Owns SQLite, orchestrates capture → triage → storage, exposes Tauri commands and events. |
| `plugins/notification-listener` (Kotlin) | `NotificationListenerService`; emits captured notifications to the host. The universal sensor. |
| `plugins/sms-reader` (Kotlin) | Reads SMS/MMS history from the Telephony provider. |
| `plugins/home-widget` (Kotlin) | The Sill — an Android App Widget; host pushes ambient state to it. |
| `plugins/theme-utils` (Kotlin) | Material You dynamic colour (portable from Threshold). |
| `packages/core` (TS) | Shared types, bucket definitions, triage glue, person-resolution helpers. |

## Event flow

1. **Capture.** The notification-listener plugin (live) and sms-reader plugin (history) push raw items to the Rust host; email (v2) is pulled by the host directly.
2. **Persist.** Host writes a row to `items` (see SPEC §6).
3. **Triage.** On-device Tier-1 model classifies bucket, resolves person, writes `gist` back (see [intelligence-and-rag.md](intelligence-and-rag.md)).
4. **Notify the UI (in-app only).** Host emits `items:changed`; the Foyer screen re-renders; the host recomputes the Sill's ambient state and pushes it to the widget.
5. **Process.** User actions (Done/Later/Mute) update `state`/`later_until`; `Later` items resurface inside Foyer at their time — never as a system notification.
6. **Depth (on tap).** Deep view invokes the Tier-2 Claude command with thread + allowed RAG context.

## Hard architectural rules

- **No outbound notifications.** Foyer has no code path that posts to the Android notification system. (The calm contract.)
- **The Sill carries no counts.** The widget receives a mood word and a soft "worth a look" phrase, never a number.
- **Plugins own their permissions** via build-time manifest injection; no hand-edited shared manifest.
- **Capture is bridged, not native-to-Rust.** Anything touching Android services lives in a Kotlin plugin.
- **Cloud egress is default-deny and tap-gated.**

## Data flow diagram

```
 capture plugins ─▶ Rust host ─▶ SQLite(items)
                       │              │
                       │              ▼
                       │        Tier-1 triage (on-device)
                       │              │
                       ▼              ▼
                 push ambient    items:changed
                 state            event
                       │              │
                       ▼              ▼
                  The Sill       The Foyer ── tap ──▶ Tier-2 Claude + RAG
                  (widget)       (screen)
```
