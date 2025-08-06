// src/main/index.ts
import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import type { Rectangle } from 'electron'
import path from 'node:path'
import { enable, initialize } from '@electron/remote/main'
import { CHANNELS } from '../shared/constants'

// Initialize @electron/remote
initialize()

let mainWindow: BrowserWindow | null = null
let isIgnoringMouseEvents = false // Start interactive by default
let interactiveRegions: Rectangle[] = []

function createWindow() {
	const primaryDisplay = screen.getPrimaryDisplay()
	const { width, height } = primaryDisplay.workAreaSize

	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		// Improve text selection behavior behind transparent window on macOS
		acceptFirstMouse: true,
		disableAutoHideCursor: true,
		webPreferences: {
			nodeIntegration: true,
			// Use contextIsolation for security; disable preload in dev to avoid missing dist file
			contextIsolation: true,
			preload: path.join(__dirname, '../preload/index.mjs'),
		},
	})

	// Enable remote module for this window
	if (mainWindow) {
		enable(mainWindow.webContents)
	}

	// Start with normal interaction everywhere
	mainWindow.setIgnoreMouseEvents(false)

	// Ensure renderer receives initial state after load
	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow?.webContents.send(CHANNELS.MOUSE_UPDATED, true)
	})

	// DevTools: not opened by default. Use manual shortcut from OS menu or Electron shortcuts if needed.
	// mainWindow.webContents.openDevTools({ mode: 'detach' })

	// Load the renderer
	if (process.env.NODE_ENV === 'development') {
		// Ensure we hit the renderer index served by electron-vite dev server
		const devUrl = 'http://localhost:5173/index.html'
		console.log('[main] Loading renderer from', devUrl)
		mainWindow.loadURL(devUrl)
	} else {
		// Production - load the built index.html
		mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
	}

	// Register global shortcut for toggling click-through: try Shift variant for macOS reliability
	globalShortcut.register('CommandOrControl+Shift+M', () => {
		// Log explicit state before toggling (current -> next)
		const nextState = !isIgnoringMouseEvents
		// nextState true means we are about to enable click-through
		console.log(`Click-through ${nextState ? 'enabled' : 'disabled'} (via ⌘⇧M)`)
		toggleMouseEvents()
	})

	// Register escape key to exit the app
	globalShortcut.register('Escape', () => {
		app.quit()
	})

	// Opacity adjustment helpers
	const adjustOpacity = (delta: number) => {
		if (!mainWindow) return
		const current = mainWindow.getOpacity?.() ?? 1
		const next = Math.min(
			1,
			Math.max(0.1, Number((current + delta).toFixed(2))),
		)
		if (typeof mainWindow.setOpacity === 'function') {
			mainWindow.setOpacity(next)
			console.log(`Opacity set to ${next}`)
		} else {
			console.log('Window opacity not supported on this platform/build.')
		}
	}

	// Decrease opacity: CommandOrControl+[
	globalShortcut.register('CommandOrControl+[', () => {
		console.log('Opacity shortcut: decrease')
		adjustOpacity(-0.1)
	})

	// Increase opacity: CommandOrControl+]
	globalShortcut.register('CommandOrControl+]', () => {
		console.log('Opacity shortcut: increase')
		adjustOpacity(0.1)
	})

	/* Set up IPC to allow renderer to toggle mouse events */
	ipcMain.on(CHANNELS.TOGGLE_MOUSE, () => {
		toggleMouseEvents()
	})

	// Exit app from renderer request
	ipcMain.on('exit-app', () => app.quit())

	// Throttled updater to reduce region re-application frequency on Windows
	let lastRegionApply = 0
	const applyRegionsThrottled = (regions: Rectangle[]) => {
		const now = Date.now()
		if (now - lastRegionApply < 50) return
		lastRegionApply = now
		if (process.platform === 'win32' && mainWindow && isIgnoringMouseEvents) {
			;(
				mainWindow as unknown as {
					setIgnoreMouseEvents: (
						ignore: boolean,
						options?: { forward?: boolean; region?: Rectangle[] },
					) => void
				}
			).setIgnoreMouseEvents(true, {
				forward: true,
				region: regions,
			})
		}
	}

	/* Listen for updated interactive regions (button/top-bar rects) from renderer */
	ipcMain.on(
		CHANNELS.UPDATE_INTERACTIVE,
		(_event: Electron.IpcMainEvent, regions: Rectangle[]) => {
			interactiveRegions = regions
			// Only Windows respects regions; on macOS full-window click-through applies
			applyRegionsThrottled(interactiveRegions)
		},
	)

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

function toggleMouseEvents() {
	if (!mainWindow) return
	isIgnoringMouseEvents = !isIgnoringMouseEvents

	if (isIgnoringMouseEvents) {
		// When enabling click-through:
		if (process.platform === 'win32') {
			// Windows supports region-based carve-outs
			;(
				mainWindow as unknown as {
					setIgnoreMouseEvents: (
						ignore: boolean,
						options?: { forward?: boolean; region?: Rectangle[] },
					) => void
				}
			).setIgnoreMouseEvents(true, {
				forward: true,
				region: interactiveRegions,
			})
		} else {
			// macOS and others: full window click-through
			mainWindow.setIgnoreMouseEvents(true, { forward: true })
		}
		// Ask renderer for current interactive rects (top bar etc.) so Windows can update regions
		mainWindow.webContents.send(CHANNELS.REQUEST_INTERACTIVE)
	} else {
		mainWindow.setIgnoreMouseEvents(false)
	}

	/* tell renderer: true = interactive, false = click-through */
	mainWindow.webContents.send(CHANNELS.MOUSE_UPDATED, !isIgnoringMouseEvents)
}

app.whenReady().then(() => {
	createWindow()
})

app.on('will-quit', () => {
	// Unregister all shortcuts when app is about to quit
	globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

/* Directly set ignore state from renderer hover events (mouseenter/leave on top bar) */
ipcMain.on(
	CHANNELS.SET_IGNORE,
	(
		_event: Electron.IpcMainEvent,
		ignore: boolean,
		options?: { forward: boolean },
	) => {
		if (mainWindow) {
			mainWindow.setIgnoreMouseEvents(ignore, options)
		}
	},
)
