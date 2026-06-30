// Shared domain types for Foyer: captured items, people, and triage rules
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

/** Where a captured item came from. RCS is notification-only (no history). */
export type ItemSource = 'sms' | 'mms' | 'rcs' | 'email' | 'notification';

/**
 * The urgency bucket an item is triaged into. Order matters: this is the
 * top-to-bottom order of the Foyer screen.
 */
export type Bucket = 'waiting-on-you' | 'worth-a-look' | 'can-wait' | 'noise';

/** The user's disposition of an item. */
export type ItemState = 'active' | 'done' | 'later' | 'muted';

/** A single captured message or notification. */
export interface Item {
	id: string;
	source: ItemSource;
	/** Package name / channel, when known (e.g. com.whatsapp). */
	sourceApp: string | null;
	/** Resolved person, null until cross-channel resolution runs. */
	personId: string | null;
	receivedAt: number;
	title: string;
	/** May be notification-truncated, especially for RCS. */
	body: string;
	/** On-device one-line summary, null until triage runs. */
	gist: string | null;
	bucket: Bucket;
	state: ItemState;
	/** When a `later` item should resurface (epoch millis). */
	laterUntil: number | null;
	/** Groups a conversation across captures. */
	threadKey: string;
}

/** A person, unifying handles across every channel. */
export interface Person {
	id: string;
	displayName: string;
	/** Phone numbers, emails, app handles that map to this person. */
	handles: string[];
	/** Relationship priority hint for triage (higher = more important). */
	weight: number;
}

export type RuleAction = 'mute' | 'pin-worth-a-look' | 'always-can-wait';

/** A user triage override. */
export interface Rule {
	id: string;
	match: {
		sourceApp?: string;
		personId?: string;
		keyword?: string;
	};
	action: RuleAction;
}

/** Ordered list of buckets as shown on the Foyer screen. */
export const BUCKET_ORDER: readonly Bucket[] = [
	'waiting-on-you',
	'worth-a-look',
	'can-wait',
	'noise',
] as const;

/** Human-facing section titles. Canadian English. */
export const BUCKET_LABELS: Record<Bucket, string> = {
	'waiting-on-you': 'Waiting on you',
	'worth-a-look': 'Worth a look',
	'can-wait': 'Can wait',
	noise: 'Noise',
};
