// Tauri bridge plugin exposing notification access state and emitting captured notifications
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

package com.plugin.notificationlistener

import android.app.Activity
import android.content.Intent
import android.provider.Settings
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin

/**
 * Bridges the Android NotificationListenerService into Tauri. The service is
 * instantiated by the system, not by this plugin, so it reaches back through
 * [Companion.emit] to deliver captured notifications to the webview.
 */
@TauriPlugin
class NotificationListenerPlugin(private val activity: Activity) : Plugin(activity) {

    override fun load(webView: android.webkit.WebView) {
        super.load(webView)
        instance = this
    }

    @Command
    fun isAccessGranted(invoke: Invoke) {
        val enabled = NotificationManagerCompatAccess.isEnabled(activity)
        val result = JSObject()
        result.put("granted", enabled)
        invoke.resolve(result)
    }

    @Command
    fun requestAccess(invoke: Invoke) {
        activity.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        invoke.resolve()
    }

    companion object {
        private var instance: NotificationListenerPlugin? = null

        /** Called by the service for each captured notification. */
        fun emit(payload: JSObject) {
            instance?.trigger("posted", payload)
        }
    }
}

/** Small helper isolating the enabled-listeners lookup. */
object NotificationManagerCompatAccess {
    fun isEnabled(activity: Activity): Boolean {
        val flat = Settings.Secure.getString(
            activity.contentResolver,
            "enabled_notification_listeners",
        ) ?: return false
        return flat.split(":").any { it.contains(activity.packageName) }
    }
}
