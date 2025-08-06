// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS } from '../shared/constants'

// Expose a typed-safe minimal API to the renderer.
// Note: we keep contextIsolation=false in this template, but this API also works with true.
contextBridge.exposeInMainWorld('electronAPI', {
	// Platform helper
	getPlatform: () => process.platform,
	// Trigger main process to toggle click-through
	toggleMouseEvents: () => ipcRenderer.send(CHANNELS.TOGGLE_MOUSE),
	// Subscribe to updates from main about current interactivity
	onToggleMouseUpdated: (callback: (interactive: boolean) => void) => {
		ipcRenderer.on(
			CHANNELS.MOUSE_UPDATED,
			(_event, value: boolean) => callback(value),
		)
	},
	// Send updated interactive regions (button rects) to main
	updateInteractiveRegions: (
		rects: { x: number; y: number; width: number; height: number }[],
	) => ipcRenderer.send('update-interactive-regions', rects),
	// Respond when main requests current interactive regions
	onRequestInteractiveRegions: (cb: () => void) =>
		ipcRenderer.on('request-interactive-regions', cb),
	// Exit the app via main process
	exit: () => ipcRenderer.send('exit-app'),
	// Directly set ignore state from renderer hover events (mouseenter/leave on top bar)
	setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) =>
		ipcRenderer.send(CHANNELS.SET_IGNORE, ignore, options),
})
