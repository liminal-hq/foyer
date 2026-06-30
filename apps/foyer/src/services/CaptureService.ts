// Capture orchestration: loads items from the local DB and listens for live
// captures from the notification-listener plugin. Falls back to mock data when
// running outside Tauri (e.g. browser preview).
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import type { Item, ItemState } from '@foyer/core/types';

const MOCK_ITEMS: Item[] = [
	{
		id: '1',
		source: 'sms',
		sourceApp: null,
		personId: 'sarah',
		receivedAt: Date.now() - 3 * 24 * 3600_000,
		title: 'Sarah',
		body: 'no worries if not but did you want to do Saturday?',
		gist: 'Asked about Saturday — you opened it 3 days ago, no reply',
		bucket: 'waiting-on-you',
		state: 'active',
		laterUntil: null,
		threadKey: 'sarah',
	},
	{
		id: '2',
		source: 'rcs',
		sourceApp: 'com.google.android.apps.messaging',
		personId: 'mum',
		receivedAt: Date.now() - 2 * 3600_000,
		title: 'Mum',
		body: 'call me when you get a chance, nothing urgent',
		gist: 'Wants a call, says not urgent',
		bucket: 'worth-a-look',
		state: 'active',
		laterUntil: null,
		threadKey: 'mum',
	},
	{
		id: '3',
		source: 'email',
		sourceApp: null,
		personId: 'bank',
		receivedAt: Date.now() - 6 * 3600_000,
		title: 'Statement ready',
		body: 'Your monthly statement is available.',
		gist: 'Routine statement notice',
		bucket: 'can-wait',
		state: 'active',
		laterUntil: null,
		threadKey: 'bank-statement',
	},
	{
		id: '4',
		source: 'notification',
		sourceApp: 'com.newsletter',
		personId: null,
		receivedAt: Date.now() - 30 * 60_000,
		title: 'Weekly digest',
		body: '10 articles you might like',
		gist: 'Newsletter',
		bucket: 'noise',
		state: 'active',
		laterUntil: null,
		threadKey: 'newsletter',
	},
];

function inTauri(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Load active items. In Tauri this will query the SQLite store; until the DB
 * wiring lands it returns mock data so the screen is reviewable.
 */
export async function loadItems(): Promise<Item[]> {
	if (!inTauri()) return MOCK_ITEMS;
	// TODO: query via @tauri-apps/plugin-sql once migrations are wired.
	return MOCK_ITEMS;
}

/** Update a single item's disposition (Done / Later / Mute). */
export async function setItemState(id: string, state: ItemState): Promise<void> {
	if (!inTauri()) return;
	// TODO: persist via @tauri-apps/plugin-sql.
	void id;
	void state;
}
