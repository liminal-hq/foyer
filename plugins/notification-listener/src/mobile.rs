// Android binding for the notification-listener plugin
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

use crate::models::AccessStatus;

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "com.plugin.notificationlistener";

pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> crate::Result<NotificationListener<R>> {
    #[cfg(not(target_os = "android"))]
    let _ = &api;

    #[cfg(target_os = "android")]
    {
        let handle =
            api.register_android_plugin(PLUGIN_IDENTIFIER, "NotificationListenerPlugin")?;
        return Ok(NotificationListener(handle));
    }

    #[cfg(not(target_os = "android"))]
    {
        Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "tauri-plugin-notification-listener supports Android only",
        )
        .into())
    }
}

/// Access to the notification-listener APIs.
pub struct NotificationListener<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> NotificationListener<R> {
    pub fn is_access_granted(&self) -> crate::Result<AccessStatus> {
        self.0
            .run_mobile_plugin("isAccessGranted", ())
            .map_err(Into::into)
    }

    pub fn request_access(&self) -> crate::Result<()> {
        self.0
            .run_mobile_plugin("requestAccess", ())
            .map_err(Into::into)
    }
}
