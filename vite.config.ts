/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 8001,
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setup.ts',
		include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
		exclude: ['src/**/delete_*.{test,spec}.?(c|m)[jt]s?(x)', 'src/E2E'],
		coverage: {
			include: ['src/**'],
			exclude: ['src/**/delete_**'],
		},
	},
});
