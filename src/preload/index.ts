// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS } from '../shared/constants'

contextBridge.exposeInMainWorld('electronAPI', {
  // Toggle content window click-through
  toggleMouseEvents: () => ipcRenderer.send(CHANNELS.TOGGLE_MOUSE),

  // Subscribe to interactivity updates and return an unsubscribe function.
  onToggleMouseUpdated: (
    callback: (interactive: boolean) => void
  ): (() => void) => {
    const handler = (_event: unknown, value: boolean) => callback(value)
    ipcRenderer.on(CHANNELS.MOUSE_UPDATED, handler)

    // Return a cleanup function to remove the listener.
    return () => {
      ipcRenderer.removeListener(CHANNELS.MOUSE_UPDATED, handler)
    }
  },

  // Opacity controls
  increaseOpacity: () => ipcRenderer.send(CHANNELS.OPACITY_INCREASE),
  decreaseOpacity: () => ipcRenderer.send(CHANNELS.OPACITY_DECREASE),

  // Exit the app
  exit: () => ipcRenderer.send('exit-app'),
})
