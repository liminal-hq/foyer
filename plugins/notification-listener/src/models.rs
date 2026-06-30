// Data models for the notification-listener plugin
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

use serde::{Deserialize, Serialize};

/// A single notification captured by the Android listener service.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CapturedNotification {
    /// The posting app's package name (e.g. com.whatsapp).
    pub package_name: String,
    pub title: String,
    pub body: String,
    /// Epoch millis when the notification was posted.
    pub posted_at: i64,
    /// Best-effort conversation/thread hint from the notification, if any.
    pub thread_hint: Option<String>,
}

/// Whether notification access has been granted in system settings.
#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccessStatus {
    pub granted: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn captured_notification_uses_camel_case_keys() {
        let n = CapturedNotification {
            package_name: "com.whatsapp".into(),
            title: "Sarah".into(),
            body: "hi".into(),
            posted_at: 1,
            thread_hint: None,
        };
        let json = serde_json::to_string(&n).unwrap();
        assert!(json.contains("\"packageName\""));
        assert!(json.contains("\"postedAt\""));
        assert!(json.contains("\"threadHint\""));
    }

    #[test]
    fn access_status_round_trips() {
        let json = serde_json::to_string(&AccessStatus { granted: true }).unwrap();
        let back: AccessStatus = serde_json::from_str(&json).unwrap();
        assert!(back.granted);
    }
}
