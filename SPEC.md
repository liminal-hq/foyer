# Foyer — Task & Specification Document

## 1. Overview

**Foyer** is a phone-first, local-first triage surface. It pulls together SMS/MMS/RCS, email, and other app notifications into one calm, pre-digested view, so that a brain prone to overwhelm can process messages in **batches by glance** instead of one anxious interruption at a time.

**Core thesis:** The phone is not the anxiety surface — a particular *interaction contract* is (unbounded, interrupting, decision-per-item, opaque, obligation-laden). Foyer replaces that contract *in place, on the phone*, by inverting all five properties. See [docs/design/calm-contract.md](docs/design/calm-contract.md).

**Foyer never sends a notification.** It is a pull surface. If it ever pings you, it has reproduced the problem.

## 2. Form Factor

Foyer is **two surfaces of one app**:

### 2.1 The Sill (home-screen widget)

The **ambient layer**. Always visible without opening anything, like a clock or barometer.

- A single calm line or small grid: e.g. `Foyer · quiet · 2 worth a look · nothing on fire`.
- A mood word, not a count: `quiet` / `stirring` / `busy`. **No unread numbers, no red badge** — counts are the anxiety.
- Tapping the Sill opens the Foyer.
- Implemented as an Android App Widget (see [docs/architecture/architecture.md](docs/architecture/architecture.md)).

### 2.2 The Foyer (the screen)

The **triage layer**, opened deliberately. A bounded, pre-triaged view, organized **by urgency** with **person as the collapse key** (all channels from one person merge into one entry).

Top-to-bottom sections:

1. **Waiting on you** — open loops *you* own: messages opened-but-never-answered, threads where someone asked a question and you went quiet, a reply quietly ageing. Framed without guilt ("here's what's been waiting"), each with a one-tap **Later**. This is the headline feature; it makes invisible backlog visible.
2. **Worth a look** — the few items (target 0–5) that probably need you soon. One-line digest each: who · gist · how long waiting · suggested "can wait until".
3. **Can wait** — collapsed by default. Grouped, summarized, no per-item pressure.
4. **Noise** — collapsed, muted. Newsletters, used OTPs, app spam. One tap to mark all seen.

Reaching the bottom of **Worth a look** with nothing in **Waiting on you** is the explicit **"you're caught up"** state — the relief / the "done".

### 2.3 Per-item interaction

- **Tap** → deep view. This is the only place cloud intelligence fires: a fuller summary, thread/person context (RAG over local files), and an optional draft reply.
- **Done** — registered/handled (possibly elsewhere); leaves the active set.
- **Later** — defer with a *trusted* resurface time, so the loop closes without action now.
- **Mute** — "this kind is noise"; future matches route straight to Noise.

## 3. Technical Architecture

A **Tauri v2 monorepo** managed with **Bun** workspaces, mirroring the conventions of Threshold. It builds and runs through the shared Liminal HQ Android container images (no local Android toolchain). See [docs/architecture/build-and-ci.md](docs/architecture/build-and-ci.md).

### Stack

- **Frontend:** React + TypeScript + MUI (Material-UI v7), Material You dynamic colour.
- **Host:** Rust (Tauri).
- **Mobile native:** Kotlin (custom Tauri plugins).
- **Persistence:** SQLite (Rust-managed via `sqlx`).
- **Intelligence:** Hybrid — on-device small model (always-on triage) + Claude API (on-demand depth/RAG). See [docs/architecture/intelligence-and-rag.md](docs/architecture/intelligence-and-rag.md).

### Intended structure (Bun workspaces in root `package.json`)

- `apps/foyer` — the main Tauri application.
- `packages/core` — shared TypeScript types + triage/classification logic.
- `plugins/notification-listener` — Kotlin `NotificationListenerService` bridge (the universal sensor).
- `plugins/sms-reader` — Telephony content-provider read for SMS/MMS history.
- `plugins/theme-utils` — Material You dynamic colour (portable from Threshold).
- `plugins/home-widget` — Android App Widget bridge for the Sill.

## 4. Capture Architecture (the hard part)

Access to Android messaging is uneven; Foyer is honest about it. See [docs/architecture/notification-capture.md](docs/architecture/notification-capture.md).

| Source | Access | Mechanism |
|--------|--------|-----------|
| **App notifications** (universal) | ✅ | `NotificationListenerService` — every posted notification's app/title/text. The primary sensor. |
| **SMS / MMS** | ✅ (sideloaded only) | `READ_SMS` + Telephony content provider for history. Play Store bans this for non-default-SMS apps; sideloading a personal build is fine. |
| **RCS** | ⚠️ notification-only | No public API or content provider. Visible *only* as it arrives via the notification listener. No history, no backfill, no full thread. Documented limitation. |
| **Email** | ✅ | Pulled server-side via IMAP / Gmail API — does not depend on the phone's notifications. |

**Key constraint:** Rust/Tauri cannot *be* a `NotificationListenerService` — it is an Android Service component written in Kotlin and bridged via a custom Tauri plugin (the `alarm-manager` pattern from Threshold). See [docs/plugins/notification-listener.md](docs/plugins/notification-listener.md).

## 5. Intelligence & RAG

Hybrid, **pull-gated** (nothing leaves the device unless the user taps for depth):

1. **On-device triage (always on).** A small local model classifies each captured item: urgency bucket (`waiting-on-you` / `worth-a-look` / `can-wait` / `noise`), person/relationship resolution across channels, and a one-line gist. Private, cheap, no heat.
2. **Cloud depth (on tap only).** When the user opens an item's deep view, Foyer calls the **Claude API** (user's own key) for a richer summary, a draft reply, and **RAG over local files** — personal notes, prior threads, calendar, contacts — to answer "what's the context here / what did we say last time / who is this".

The user configures exactly what categories of content may be sent on a cloud call. Default-deny for anything not tapped. Full detail in [docs/architecture/intelligence-and-rag.md](docs/architecture/intelligence-and-rag.md).

## 6. Data Model (initial sketch)

`items` — one row per captured message/notification:

- `id` (PK)
- `source` (`'sms' | 'mms' | 'rcs' | 'email' | 'notification'`)
- `source_app` (package name / channel, nullable)
- `person_id` (FK → `people`, nullable until resolved)
- `received_at` (epoch millis)
- `title`, `body` (text; body may be notification-truncated for RCS)
- `gist` (text — on-device one-line summary, nullable until processed)
- `bucket` (`'waiting-on-you' | 'worth-a-look' | 'can-wait' | 'noise'`)
- `state` (`'active' | 'done' | 'later' | 'muted'`)
- `later_until` (epoch millis, nullable)
- `thread_key` (text — groups a conversation)

`people` — cross-channel identity:

- `id` (PK)
- `display_name`
- `handles` (JSON — phone numbers, emails, app handles that map to this person)
- `weight` (int — relationship priority hint for triage)

`rules` — user triage overrides:

- `id` (PK)
- `match` (JSON — by source_app, person, keyword)
- `action` (`'mute' | 'pin-worth-a-look' | 'always-can-wait'`)

## 7. Requirements

### Functional

1. **Capture** notifications via the listener plugin; read SMS/MMS history; pull email via IMAP/Gmail.
2. **Resolve** items to people across channels.
3. **Triage** each item on-device into a bucket; surface a one-line gist.
4. **Glance:** the Sill widget shows ambient mood + a "worth a look" count word, never a numeric badge.
5. **Process:** the Foyer screen shows Waiting-on-you / Worth-a-look / Can-wait / Noise with Done / Later / Mute.
6. **Depth (on tap):** cloud summary + draft reply + RAG context, gated by user-configured allow rules.
7. **Trusted Later:** deferred items resurface at `later_until` — inside Foyer, never as a system notification.

### Non-Functional

- **No notifications emitted by Foyer, ever.** (Hard rule.)
- **Privacy:** local-first; default-deny on cloud egress; user-scoped allow rules; no analytics.
- **Spelling:** Canadian English in all strings, code, comments, and docs.
- **Calm:** no unread counts on the Sill; bounded sections; explicit caught-up state.

## 8. v1 Scope (deliberately tiny)

Ship the smallest thing that can *replace* checking the apps for triage:

- ✅ Notification-listener plugin capturing all apps.
- ✅ SMS/MMS history read.
- ✅ On-device triage into the four buckets + person resolution.
- ✅ The Foyer screen (Waiting-on-you / Worth-a-look / Can-wait / Noise; Done / Later / Mute).
- ✅ The Sill widget (mood word + worth-a-look word, no counts).
- ✅ "Waiting on you" detection (opened-not-replied / question-went-quiet).

**Explicitly deferred past v1:**

- Email integration (IMAP/Gmail) — high value but adds an auth + sync surface; land it second.
- Cloud depth + RAG (tap-to-expand) — design it in v1's data model, enable it in v2.
- Draft replies / send-from-Foyer.
- Desktop surface (only if a real need emerges; phone-first holds).

## 9. Open Design Tensions

Recorded, not resolved — so nothing is silently locked:

- **Calm contract.** v1 commits to *Sill = ambient weather, Foyer = bounded deck*. The pure "daily tide" (auto-resetting, today-only) model remains an alternative if the bounded deck still feels like a backlog.
- **Glance axis.** v1 is *urgency-primary, person-secondary*. If "who am I leaving hanging" turns out to dominate in practice, person-primary is the fallback.
- **The one allowed exception.** Foyer emits zero notifications in v1. Whether a single, user-defined "this genuinely can't wait" escalation should ever break that silence is left open; the default is no.
- **RCS history.** Inherently unavailable; revisit only if Google exposes an API (don't hold your breath).

## 10. References

- [docs/design/calm-contract.md](docs/design/calm-contract.md) — the philosophy and the five inversions
- [docs/architecture/architecture.md](docs/architecture/architecture.md) — components and data flow
- [docs/architecture/notification-capture.md](docs/architecture/notification-capture.md) — Android capture reality
- [docs/architecture/intelligence-and-rag.md](docs/architecture/intelligence-and-rag.md) — hybrid model + RAG
- [docs/plugins/notification-listener.md](docs/plugins/notification-listener.md) — the sensor plugin
- [AGENTS.md](AGENTS.md) — conventions
