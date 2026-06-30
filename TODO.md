# TODO

## v1 — the smallest thing that can replace checking the apps for triage

- [x] Scaffold the Tauri v2 Bun monorepo (mirror Threshold's layout).
- [ ] `plugins/notification-listener` — Kotlin `NotificationListenerService` + Tauri bridge.
- [ ] `plugins/sms-reader` — Telephony provider read for SMS/MMS history.
- [ ] Rust host: SQLite schema (`items`, `people`, `rules`) + capture orchestration.
- [ ] Tier-1 on-device triage: bucket + person resolution + gist.
- [ ] "Waiting on you" detection (opened-not-replied / question-went-quiet / ageing reply).
- [ ] The Foyer screen: four buckets, Done / Later / Mute, "caught up" state.
- [ ] `plugins/home-widget` — the Sill (mood word, no counts).
- [ ] Trusted Later: in-app resurfacing (never a system notification).

## CI / infrastructure

- [x] Container-based CI (`tauri-ci-mobile`): JS/TS (Vitest) + Rust (`cargo test`, fmt, clippy).
- [x] Devcontainer on `tauri-dev-mobile` with Bun.
- [ ] Kotlin unit tests in CI — needs the Tauri-generated `tauri-android` Gradle module (`tauri android init`).
- [ ] Android build smoke job + release/signing workflow (keystore mount, Play Console).

## v2

- [ ] Email integration (IMAP / Gmail API).
- [ ] Tier-2 cloud depth: tap-to-expand summary, draft reply, RAG over local files.
- [ ] Allow-rule editor for cloud egress.

## Open tensions (see SPEC §9)

- [ ] Validate calm contract: does the bounded deck still feel like a backlog? (fallback: daily tide)
- [ ] Validate glance axis: urgency-primary vs person-primary in real use.
- [ ] Decide whether a single user-defined "can't wait" escalation may ever break notification silence (default: no).
