# Android Capture Architecture

Foyer's value depends on getting messages *in*. Android access is uneven; this document is the honest map.

## Sources

### App notifications — the universal sensor ✅

`NotificationListenerService` is a privileged Android service that receives every notification as it is posted: source package, title, text, timestamp, actions. Granted once by the user in **Settings → Notification access**; works on sideloaded apps.

This is the firehose that unifies *everything* — SMS, RCS, WhatsApp, Signal, Gmail/email apps, dating apps — into a single pipe. It is Foyer's primary sensor.

**Constraint:** Rust/Tauri cannot *be* this service. It is an Android Service component written in Kotlin, declared in the manifest, and bridged into the app via a custom Tauri plugin — the same shape as Threshold's `alarm-manager`. See [../plugins/notification-listener.md](../plugins/notification-listener.md).

### SMS / MMS — full history ✅ (sideloaded only)

With `READ_SMS`, the Telephony content provider (`content://sms`, `content://mms`) yields full history and threads. Google Play forbids `READ_SMS` for apps that are not the default SMS handler, but a **sideloaded personal build is unaffected** — and Foyer is sideloaded and local-first by design.

Use this for backfill and complete threads; the notification listener only sees messages that arrive *while running*.

### RCS — notification-only ⚠️

RCS (Google Messages / Jibe) stores messages in a **private, sandboxed database** inside `com.google.android.apps.messaging`. There is **no public API and no content provider.** The only way Foyer can see an RCS message is to catch its **notification as it arrives**.

Consequences, stated plainly:

- No history / no backfill for RCS.
- No guaranteed full thread — only what the notification exposes (often truncated).
- If the user clears or never receives the notification, Foyer never sees it.

This is a hard platform limitation, not a Foyer shortcoming. Revisit only if Google ships a real API.

### Email — server-side ✅

Email does not go through the phone's notification path at all. Foyer pulls it directly via **IMAP** or the **Gmail API**, server-side, giving clean history and structure. Deferred to v2 to avoid adding an auth + sync surface to v1, but designed into the data model from the start.

## Flow

```
                    ┌──────────────────────────────┐
  RCS / WhatsApp ──▶│  NotificationListenerService │
  SMS / dating app  │        (Kotlin plugin)       │
  arriving live ───▶└──────────────┬───────────────┘
                                   │ bridged events
  SMS/MMS history ─▶ Telephony ───▶│
                    provider       ▼
  Email (v2) ─────▶ IMAP/Gmail ─▶ Rust host ─▶ SQLite (items)
                                   │
                                   ▼
                     On-device triage (bucket + person + gist)
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                     The Sill          The Foyer
                     (widget)          (screen)
```

## Permissions Foyer requests

- **Notification access** (`BIND_NOTIFICATION_LISTENER_SERVICE`) — the sensor. User-granted in Settings.
- **`READ_SMS`** — SMS/MMS history.
- Each is **owned by its plugin** via build-time manifest injection (see AGENTS.md → Plugin Development), never hand-edited into a shared manifest.

## What Foyer deliberately does *not* do

- It does not become the default SMS app (keeps your existing messaging intact).
- It does not attempt to crack the RCS database (impossible and brittle).
- It does not post notifications of its own (the calm contract).
