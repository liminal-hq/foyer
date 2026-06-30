// Triage helpers: grouping captured items into the Foyer's calm sections
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { BUCKET_ORDER, type Bucket, type Item } from './types';

/** The calm word the Sill widget shows, derived from active workload. Never a count. */
export type Mood = 'quiet' | 'stirring' | 'busy';

/**
 * Group active items into ordered buckets. Done/later/muted items are excluded
 * so the Foyer only ever shows what is genuinely active.
 */
export function groupByBucket(items: Item[]): Record<Bucket, Item[]> {
	const groups: Record<Bucket, Item[]> = {
		'waiting-on-you': [],
		'worth-a-look': [],
		'can-wait': [],
		noise: [],
	};
	for (const item of items) {
		if (item.state !== 'active') continue;
		groups[item.bucket].push(item);
	}
	for (const bucket of BUCKET_ORDER) {
		groups[bucket].sort((a, b) => b.receivedAt - a.receivedAt);
	}
	return groups;
}

/**
 * "Caught up" is the calm contract's done-state: nothing waiting on you and
 * nothing worth a look. Can-wait and noise do not block the caught-up state.
 */
export function isCaughtUp(groups: Record<Bucket, Item[]>): boolean {
	return groups['waiting-on-you'].length === 0 && groups['worth-a-look'].length === 0;
}

/**
 * Derive the Sill's ambient mood from the two attention-demanding buckets.
 * Deliberately coarse — the widget shows a word, not a number.
 */
export function moodFor(groups: Record<Bucket, Item[]>): Mood {
	const demanding = groups['waiting-on-you'].length + groups['worth-a-look'].length;
	if (demanding === 0) return 'quiet';
	if (demanding <= 3) return 'stirring';
	return 'busy';
}
