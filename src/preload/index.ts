// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS } from '../shared/constants'

contextBridge.exposeInMainWorld('electronAPI', {
	// Opacity
	increaseOpacity: () => ipcRenderer.send(CHANNELS.OPACITY_INCREASE),
	decreaseOpacity: () => ipcRenderer.send(CHANNELS.OPACITY_DECREASE),

	// Exit
	exit: () => ipcRenderer.send('exit-app'),

	// Toggle click-through
	toggleMouseEvents: () => ipcRenderer.send(CHANNELS.TOGGLE_MOUSE),

	// Subscribe to interactivity updates (returns unsubscribe)
	onToggleMouseUpdated: (callback: (state: boolean) => void) => {
		const handler = (_: unknown, next: boolean) => callback(next)
		ipcRenderer.on(CHANNELS.MOUSE_UPDATED, handler)
		return () => ipcRenderer.removeListener(CHANNELS.MOUSE_UPDATED, handler)
	},

	// Set mouse ignore (hover guard)
	setMouseIgnore: (ignore: boolean) =>
		ipcRenderer.send(CHANNELS.SET_MOUSE_IGNORE, ignore),
})
