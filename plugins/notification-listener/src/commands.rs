// Tauri commands exposed by the notification-listener plugin
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

use tauri::{command, AppHandle, Runtime};

use crate::models::AccessStatus;
use crate::NotificationListenerExt;
use crate::Result;

#[command]
pub(crate) async fn is_access_granted<R: Runtime>(app: AppHandle<R>) -> Result<AccessStatus> {
    app.notification_listener().is_access_granted()
}

#[command]
pub(crate) async fn request_access<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.notification_listener().request_access()
}
