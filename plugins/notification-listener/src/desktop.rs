// Desktop fallback for the notification-listener plugin (no-op sensor)
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::AccessStatus;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<NotificationListener<R>> {
    Ok(NotificationListener(app.clone()))
}

/// Access to the notification-listener APIs.
pub struct NotificationListener<R: Runtime>(AppHandle<R>);

impl<R: Runtime> NotificationListener<R> {
    pub fn is_access_granted(&self) -> crate::Result<AccessStatus> {
        // No system notification stream on desktop; report not granted.
        Ok(AccessStatus { granted: false })
    }

    pub fn request_access(&self) -> crate::Result<()> {
        Ok(())
    }
}
