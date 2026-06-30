const COMMANDS: &[&str] = &["is_access_granted", "request_access"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .build();

    inject_android_permissions()
        .expect("Failed to inject Android manifest permissions for notification-listener");
}

fn inject_android_permissions() -> std::io::Result<()> {
    // The NotificationListenerService is bound by the system; the app must hold
    // BIND_NOTIFICATION_LISTENER_SERVICE and declare the service component. The
    // service itself is declared in the plugin's library AndroidManifest.xml.
    let permissions: Vec<&str> = vec![
        r#"<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />"#,
    ];

    tauri_plugin::mobile::update_android_manifest(
        "tauri-plugin-notification-listener.permissions",
        "manifest",
        permissions.join("\n"),
    )
    .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
}
