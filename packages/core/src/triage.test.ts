// Tests for triage grouping, caught-up detection, and Sill mood
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { describe, expect, it } from 'vitest';
import { groupByBucket, isCaughtUp, moodFor } from './triage';
import type { Bucket, Item } from './types';

function item(partial: Partial<Item> & { bucket: Bucket }): Item {
	return {
		id: Math.random().toString(36).slice(2),
		source: 'notification',
		sourceApp: null,
		personId: null,
		receivedAt: Date.now(),
		title: 'x',
		body: 'x',
		gist: null,
		state: 'active',
		laterUntil: null,
		threadKey: 't',
		...partial,
	};
}

describe('groupByBucket', () => {
	it('excludes non-active items', () => {
		const groups = groupByBucket([
			item({ bucket: 'worth-a-look', state: 'done' }),
			item({ bucket: 'worth-a-look', state: 'active' }),
		]);
		expect(groups['worth-a-look']).toHaveLength(1);
	});

	it('sorts newest first within a bucket', () => {
		const groups = groupByBucket([
			item({ bucket: 'can-wait', receivedAt: 100 }),
			item({ bucket: 'can-wait', receivedAt: 200 }),
		]);
		expect(groups['can-wait'][0].receivedAt).toBe(200);
	});
});

describe('isCaughtUp', () => {
	it('is true when only can-wait/noise remain', () => {
		const groups = groupByBucket([
			item({ bucket: 'can-wait' }),
			item({ bucket: 'noise' }),
		]);
		expect(isCaughtUp(groups)).toBe(true);
	});

	it('is false while something is worth a look', () => {
		const groups = groupByBucket([item({ bucket: 'worth-a-look' })]);
		expect(isCaughtUp(groups)).toBe(false);
	});
});

describe('moodFor', () => {
	it('maps demanding load to a coarse word', () => {
		expect(moodFor(groupByBucket([]))).toBe('quiet');
		expect(moodFor(groupByBucket([item({ bucket: 'worth-a-look' })]))).toBe('stirring');
		expect(
			moodFor(
				groupByBucket([
					item({ bucket: 'waiting-on-you' }),
					item({ bucket: 'waiting-on-you' }),
					item({ bucket: 'worth-a-look' }),
					item({ bucket: 'worth-a-look' }),
				]),
			),
		).toBe('busy');
	});
});
