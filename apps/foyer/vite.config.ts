import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
	plugins: [react()],
	resolve: {
		// Resolve @foyer/core to its TypeScript source during development.
		conditions: ['source', 'import', 'module', 'browser', 'default'],
	},
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: '0.0.0.0',
		hmr: host ? { protocol: 'ws', port: 1421 } : undefined,
		watch: {
			ignored: ['**/src-tauri/**'],
		},
	},
}));
