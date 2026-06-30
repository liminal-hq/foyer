// Foyer app crate entry point: plugin registration and capture wiring
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

mod db;

use tauri::Listener;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(db::DB_URL, db::migrations())
                .build(),
        )
        .plugin(tauri_plugin_notification_listener::init())
        .setup(|app| {
            // The notification-listener plugin emits a posted notification as it
            // arrives. The capture pipeline (triage + persistence) hooks in here.
            app.listen("notification-listener://posted", |event| {
                // TODO: parse the payload, triage on-device, persist to `items`.
                log::debug!("captured notification: {}", event.payload());
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Foyer");
}
