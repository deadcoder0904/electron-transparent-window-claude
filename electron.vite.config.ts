import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'electron-vite'

export default defineConfig({
	main: {
		build: {
			outDir: 'dist/main',
			rollupOptions: {
				external: ['electron', '@electron/remote'],
			},
			target: 'node20',
		},
	},
	preload: {
		build: {
			outDir: 'dist/preload',
			target: 'node20',
		},
	},
	renderer: {
		// Ensure Vite resolves the renderer root correctly so Tailwind scans templates
		root: path.join(__dirname, 'src/renderer'),
		plugins: [tailwindcss()],
		// Make sure Tailwind can see TSX/HTML content via Vite (v4 uses CSS-first config)
		build: {
			outDir: path.join(__dirname, 'dist/renderer'),
			rollupOptions: {
				input: {
					main: path.join(__dirname, 'src/renderer/index.html'),
					'top-bar': path.join(__dirname, 'src/renderer/top-bar.html'),
				},
			},
		},
		server: {
			host: true,
			port: 5173,
		},
		resolve: {
			alias: {
				'@': path.join(__dirname, 'src'),
				'@/renderer': path.join(__dirname, 'src/renderer'),
			},
		},
	},
})
