# Plugin: notification-listener

The universal sensor. A custom Tauri v2 plugin wrapping an Android `NotificationListenerService`, bridging captured notifications into the Rust host. Same architectural shape as Threshold's `alarm-manager`.

## Why a plugin (not Rust)

`NotificationListenerService` is an Android Service component. It must be written in Kotlin, declared in the Android manifest with the `BIND_NOTIFICATION_LISTENER_SERVICE` permission, and bound by the system. Rust/Tauri cannot implement it directly — the plugin is the bridge.

## Responsibilities

- Run a `NotificationListenerService` that receives `onNotificationPosted(StatusBarNotification)`.
- Extract `packageName`, `title`, `text`/`bigText`, `postTime`, and conversation/thread hints where present.
- Forward each captured notification to the Rust host as a plugin event.
- Expose a command to query whether notification access is currently granted, and one to open the system grant screen.

## Surface (sketch)

Commands:

- `is_access_granted() -> bool`
- `request_access()` — opens `Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS`.

Events (Kotlin → Rust host):

- `notification://posted` — `{ packageName, title, body, postedAt, threadHint }`

## Permissions (owned by the plugin)

Injected at build time via `tauri_plugin::mobile::update_android_manifest()` in `build.rs` (see AGENTS.md → Plugin Development). The service and its `BIND_NOTIFICATION_LISTENER_SERVICE` permission plus the `<service>` component with the `android.service.notification.NotificationListenerService` intent filter are declared by the plugin, never hand-added to a shared manifest.

## Notes & limits

- Only captures notifications posted **while the listener is bound** — no history. SMS/MMS history comes from `sms-reader`; RCS has no history at all (see [../architecture/notification-capture.md](../architecture/notification-capture.md)).
- Notification text may be truncated by the posting app; the body is best-effort.
- The listener should de-duplicate against the sms-reader source so an SMS captured both ways becomes one `items` row (key on `thread_key` + `postedAt` proximity).

## Reference

Model the manifest-injection `build.rs` and the JS/Rust command wiring on Threshold's `plugins/alarm-manager`.
