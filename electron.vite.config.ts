// electron-vite config
// Outputs: dist/main, dist/preload, dist/renderer
// Renderer inputs: src/renderer/index.html; Dev server: http://localhost:5173
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'electron-vite'

export default defineConfig({
	main: {
		build: {
			outDir: 'dist/main',
			rollupOptions: {
				external: ['electron'],
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
		// Renderer root
		root: path.join(__dirname, 'src/renderer'),
		plugins: [tailwindcss()],
		// Build inputs
		build: {
			outDir: path.join(__dirname, 'dist/renderer'),
			rollupOptions: {
				input: {
					main: path.join(__dirname, 'src/renderer/index.html'),
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
