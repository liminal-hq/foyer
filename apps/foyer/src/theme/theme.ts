// Calm MUI theme for Foyer — low contrast, generous spacing, no alarm-red by default
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { createTheme } from '@mui/material/styles';
import type { Bucket } from '@foyer/core/types';

export const theme = createTheme({
	palette: {
		mode: 'dark',
		background: { default: '#14161a', paper: '#1b1e24' },
		primary: { main: '#9bb4d8' },
		text: { primary: '#e6e9ef', secondary: '#9aa3b2' },
	},
	shape: { borderRadius: 16 },
	typography: {
		fontFamily: 'system-ui, -apple-system, sans-serif',
	},
});

/**
 * Bucket accent colours. Deliberately muted — "waiting on you" is the warmest
 * the palette gets; nothing here is an alarm.
 */
export const BUCKET_ACCENT: Record<Bucket, string> = {
	'waiting-on-you': '#d8a48f',
	'worth-a-look': '#9bb4d8',
	'can-wait': '#7e8796',
	noise: '#4b525e',
};
