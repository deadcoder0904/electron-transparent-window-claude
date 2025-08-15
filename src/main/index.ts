// src/main/index.ts
import {
	app,
	BrowserWindow,
	globalShortcut,
	ipcMain,
	Rectangle,
	screen,
} from 'electron'
import path from 'node:path'
import { CHANNELS, OPACITY_STEP, SHORTCUTS } from '../shared/constants'

// App state
const state = {
	mainWindow: null as BrowserWindow | null,
	// true = interactive (not click-through); false = click-through mode
	isInteractive: true,
}

// Create the overlay window
function createMainWindow(bounds: Rectangle): BrowserWindow {
	const window = new BrowserWindow({
		...bounds,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		focusable: true,
		resizable: false,
		fullscreenable: false,
		movable: false,
		skipTaskbar: false,
		show: true,
		acceptFirstMouse: true,
		backgroundColor: '#00000000',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: false,
			preload: path.join(__dirname, '../preload/index.mjs'),
		},
	})
	// Interactive by default; per-region click-through is CSS-driven.
	window.on('closed', () => (state.mainWindow = null))
	return window
}

// Adjust overlay opacity (0.1..1.0)
function adjustOpacity(delta: number) {
	const win = state.mainWindow
	if (!win) return
	const current = win.getOpacity()
	const next = Math.min(1, Math.max(0.1, Number((current + delta).toFixed(2))))
	win.setOpacity(next)
}

// Initialize app and load renderer
function initializeApp() {
	const { workArea } = screen.getPrimaryDisplay()
	state.mainWindow = createMainWindow(workArea)

	// Start interactive
	state.isInteractive = true
	state.mainWindow.setIgnoreMouseEvents(false)

	// Load renderer content (single HTML)
	loadRenderer(state.mainWindow, 'index')
}

// IPC helpers
function sendInteractivity(updated: boolean) {
	const win = state.mainWindow
	if (!win) return
	win.webContents.send(CHANNELS.MOUSE_UPDATED, updated)
}

function applyMouseIgnore(ignore: boolean) {
	const win = state.mainWindow
	if (!win) return
	win.setIgnoreMouseEvents(ignore, { forward: true })
}

// Wire IPC events (opacity, toggle, hover guard, exit)
function registerIpcHandlers() {
	ipcMain.on(CHANNELS.OPACITY_INCREASE, () => adjustOpacity(OPACITY_STEP))
	ipcMain.on(CHANNELS.OPACITY_DECREASE, () => adjustOpacity(-OPACITY_STEP))
	ipcMain.on('exit-app', () => app.quit())

	ipcMain.on(CHANNELS.TOGGLE_MOUSE, () => {
		state.isInteractive = !state.isInteractive
		if (state.isInteractive) applyMouseIgnore(false)
		sendInteractivity(state.isInteractive)
	})

	ipcMain.on(CHANNELS.SET_MOUSE_IGNORE, (_evt, ignore: boolean) => {
		if (!state.isInteractive) applyMouseIgnore(ignore)
	})
}

// Register global shortcuts (exit, opacity, toggle)
function registerGlobalShortcuts() {
	globalShortcut.register(SHORTCUTS.EXIT, () => app.quit())
	globalShortcut.register(
		SHORTCUTS.OPACITY_DECREASE,
		() => adjustOpacity(-OPACITY_STEP),
	)
	globalShortcut.register(
		SHORTCUTS.OPACITY_INCREASE,
		() => adjustOpacity(OPACITY_STEP),
	)
	globalShortcut.register(SHORTCUTS.TOGGLE_MOUSE, () => {
		ipcMain.emit(CHANNELS.TOGGLE_MOUSE)
	})
}

// Load a renderer page (dev/prod)
function loadRenderer(win: BrowserWindow, page: 'index') {
	const devBase = 'http://localhost:5173'
	const prodFile = path.join(__dirname, '../renderer', `${page}.html`)
	if (process.env.NODE_ENV === 'development') {
		win.loadURL(`${devBase}/${page}.html`)
	} else {
		win.loadFile(prodFile)
	}
}

// Re-apply bounds when displays change
function registerScreenEventListeners() {
	const onDisplayChange = () => {
		if (!state.mainWindow) return
		const primary = screen.getPrimaryDisplay()
		const { x, y, width, height } = primary.workArea
		state.mainWindow.setBounds({ x, y, width, height })
	}
	screen.on('display-metrics-changed', onDisplayChange)
	screen.on('display-added', onDisplayChange)
	screen.on('display-removed', onDisplayChange)
}

// App lifecycle
app.whenReady().then(() => {
	initializeApp()
	registerIpcHandlers()
	registerGlobalShortcuts()
	registerScreenEventListeners()

	app.on('activate', () => {
		if (!state.mainWindow) {
			initializeApp()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('will-quit', () => {
	globalShortcut.unregisterAll()
})
