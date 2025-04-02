// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS } from '../shared/constants'

contextBridge.exposeInMainWorld('electronAPI', {
	toggleMouseEvents: () => ipcRenderer.send(CHANNELS.TOGGLE_MOUSE),
	onToggleMouseUpdated: (callback: any) =>
		ipcRenderer.on(CHANNELS.MOUSE_UPDATED, (_, value) => callback(value)),
})
