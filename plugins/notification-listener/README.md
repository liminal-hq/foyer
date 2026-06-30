# tauri-plugin-notification-listener

Foyer's universal capture sensor. Wraps an Android `NotificationListenerService` and bridges every posted notification into Tauri, so SMS, RCS, WhatsApp, email apps, and dating apps all arrive through one pipe.

Foyer **only reads** notifications — it never posts them. See [../../docs/design/calm-contract.md](../../docs/design/calm-contract.md).

## API (JS)

```ts
import {
  isAccessGranted,
  requestAccess,
  onNotificationPosted,
} from 'tauri-plugin-notification-listener-api';

if (!(await isAccessGranted()).granted) {
  await requestAccess(); // opens system Notification access settings
}

const unlisten = await onNotificationPosted((n) => {
  // n.packageName, n.title, n.body, n.postedAt, n.threadHint
});
```

## Platform support

- **Android:** full support via `FoyerNotificationListenerService`.
- **Desktop:** no-op (`isAccessGranted` returns `false`); there is no system notification stream to read.

## Permissions

The plugin owns `BIND_NOTIFICATION_LISTENER_SERVICE` and declares the service component via build-time manifest injection (`build.rs`). No manual manifest editing is required by consumers.

## Notes

- Captures only while bound (no history). SMS/MMS history comes from a separate Telephony reader; RCS has no history at all. See [../../docs/architecture/notification-capture.md](../../docs/architecture/notification-capture.md).
