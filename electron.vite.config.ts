import { defineConfig } from 'electron-vite'
import path from 'path'

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
		root: path.join(__dirname, 'src/renderer'),
		build: {
			outDir: path.join(__dirname, 'dist/renderer'),
		},
	},
})
