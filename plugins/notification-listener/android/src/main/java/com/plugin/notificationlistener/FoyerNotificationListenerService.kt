// Android NotificationListenerService — Foyer's universal capture sensor (read-only)
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

package com.plugin.notificationlistener

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import app.tauri.plugin.JSObject

/**
 * The universal sensor. The system binds this once the user grants notification
 * access; every posted notification is forwarded to the plugin, which emits it
 * to the Foyer webview. Foyer only reads — it never posts notifications itself.
 */
class FoyerNotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val extras = sbn.notification.extras
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val body = (extras.getCharSequence("android.bigText")
            ?: extras.getCharSequence("android.text"))?.toString() ?: ""

        val payload = JSObject()
        payload.put("packageName", sbn.packageName)
        payload.put("title", title)
        payload.put("body", body)
        payload.put("postedAt", sbn.postTime)
        payload.put("threadHint", sbn.notification.group)

        NotificationListenerPlugin.emit(payload)
    }
}
