// App shell: theme provider + the Foyer screen
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';
import { Foyer } from './screens/Foyer';

export function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Foyer />
		</ThemeProvider>
	);
}
