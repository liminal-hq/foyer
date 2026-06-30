// JS/TS API for the notification-listener plugin
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface AccessStatus {
	granted: boolean;
}

export interface CapturedNotification {
	packageName: string;
	title: string;
	body: string;
	postedAt: number;
	threadHint: string | null;
}

/** Whether notification access has been granted in system settings. */
export async function isAccessGranted(): Promise<AccessStatus> {
	return await invoke('plugin:notification-listener|is_access_granted');
}

/** Open the system screen where the user grants notification access. */
export async function requestAccess(): Promise<void> {
	await invoke('plugin:notification-listener|request_access');
}

/** Subscribe to notifications as they are captured. Returns an unlisten fn. */
export async function onNotificationPosted(
	handler: (notification: CapturedNotification) => void,
): Promise<UnlistenFn> {
	return await listen<CapturedNotification>('notification-listener://posted', (event) => {
		handler(event.payload);
	});
}
