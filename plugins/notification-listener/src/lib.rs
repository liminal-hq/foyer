// notification-listener plugin: the universal capture sensor for Foyer
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::NotificationListener;
#[cfg(mobile)]
use mobile::NotificationListener;

/// The event emitted to the host whenever a notification is captured.
pub const NOTIFICATION_POSTED_EVENT: &str = "notification-listener://posted";

/// Extension trait to access the notification-listener APIs from a [`Manager`].
pub trait NotificationListenerExt<R: Runtime> {
    fn notification_listener(&self) -> &NotificationListener<R>;
}

impl<R: Runtime, T: Manager<R>> NotificationListenerExt<R> for T {
    fn notification_listener(&self) -> &NotificationListener<R> {
        self.state::<NotificationListener<R>>().inner()
    }
}

/// Initialise the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("notification-listener")
        .invoke_handler(tauri::generate_handler![
            commands::is_access_granted,
            commands::request_access
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let listener = mobile::init(app, api)?;
            #[cfg(desktop)]
            let listener = desktop::init(app, api)?;
            app.manage(listener);
            Ok(())
        })
        .build()
}
