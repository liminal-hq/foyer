// The Foyer screen: the bounded, pre-triaged view. Sections in urgency order,
// each item collapsible, with Done / Later / Mute. Ends in a "caught up" state.
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Chip,
	Stack,
	Typography,
} from '@mui/material';
import { groupByBucket, isCaughtUp } from '@foyer/core/triage';
import {
	BUCKET_LABELS,
	BUCKET_ORDER,
	type Bucket,
	type Item,
	type ItemState,
} from '@foyer/core/types';
import { BUCKET_ACCENT } from '../theme/theme';
import { loadItems, setItemState } from '../services/CaptureService';

function howLong(receivedAt: number): string {
	const mins = Math.round((Date.now() - receivedAt) / 60_000);
	if (mins < 60) return `${mins}m`;
	const hrs = Math.round(mins / 60);
	if (hrs < 24) return `${hrs}h`;
	return `${Math.round(hrs / 24)}d`;
}

function ItemRow({
	item,
	onAct,
}: {
	item: Item;
	onAct: (id: string, state: ItemState) => void;
}) {
	return (
		<Box sx={{ py: 1.25 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="baseline">
				<Typography variant="subtitle2">{item.title}</Typography>
				<Typography variant="caption" color="text.secondary">
					{howLong(item.receivedAt)}
				</Typography>
			</Stack>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
				{item.gist ?? item.body}
			</Typography>
			<Stack direction="row" spacing={1}>
				<Button size="small" onClick={() => onAct(item.id, 'done')}>
					Done
				</Button>
				<Button size="small" onClick={() => onAct(item.id, 'later')}>
					Later
				</Button>
				<Button size="small" color="inherit" onClick={() => onAct(item.id, 'muted')}>
					Mute
				</Button>
			</Stack>
		</Box>
	);
}

function Section({
	bucket,
	items,
	onAct,
}: {
	bucket: Bucket;
	items: Item[];
	onAct: (id: string, state: ItemState) => void;
}) {
	// Can-wait and noise start collapsed — they should never demand attention.
	const [open, setOpen] = useState(bucket === 'waiting-on-you' || bucket === 'worth-a-look');
	if (items.length === 0) return null;
	return (
		<Box sx={{ borderLeft: `3px solid ${BUCKET_ACCENT[bucket]}`, pl: 2, mb: 2 }}>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				sx={{ cursor: 'pointer' }}
				onClick={() => setOpen((v) => !v)}
			>
				<Typography variant="overline">{BUCKET_LABELS[bucket]}</Typography>
				<Chip size="small" label={items.length} variant="outlined" />
			</Stack>
			{open && items.map((item) => <ItemRow key={item.id} item={item} onAct={onAct} />)}
		</Box>
	);
}

export function Foyer() {
	const [items, setItems] = useState<Item[]>([]);

	useEffect(() => {
		loadItems().then(setItems);
	}, []);

	function onAct(id: string, state: ItemState) {
		setItems((prev) => prev.map((it) => (it.id === id ? { ...it, state } : it)));
		void setItemState(id, state);
	}

	const groups = groupByBucket(items);
	const caughtUp = isCaughtUp(groups);

	return (
		<Box sx={{ maxWidth: 560, mx: 'auto', p: 3 }}>
			<Typography variant="h5" sx={{ mb: 3 }}>
				Foyer
			</Typography>

			{caughtUp ? (
				<Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
					You're caught up. Nothing's waiting on you.
				</Typography>
			) : (
				BUCKET_ORDER.map((bucket) => (
					<Section key={bucket} bucket={bucket} items={groups[bucket]} onAct={onAct} />
				))
			)}
		</Box>
	);
}
