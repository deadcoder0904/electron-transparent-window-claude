// src/main/index.ts
import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron'
import path from 'path'
import { enable, initialize } from '@electron/remote/main'

// Initialize @electron/remote
initialize()

let mainWindow: BrowserWindow | null = null
let isIgnoringMouseEvents = true // Track the state

function createWindow() {
	const primaryDisplay = screen.getPrimaryDisplay()
	const { width, height } = primaryDisplay.workAreaSize

	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			preload: path.join(__dirname, '../preload/index.mjs'),
		},
	})

	// Enable remote module for this window
	if (mainWindow) {
		enable(mainWindow.webContents)
	}

	// Start with mouse events being ignored
	mainWindow.setIgnoreMouseEvents(isIgnoringMouseEvents, { forward: true })

	// Load the index.html file
	if (process.env.NODE_ENV === 'development') {
		// Dev - load from Vite dev server
		mainWindow.loadURL('http://localhost:5173')
	} else {
		// Production - load the built index.html
		mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
	}

	// Register global shortcut for toggling mouse events: Command+Option+M
	globalShortcut.register('CommandOrControl+Option+M', () => {
		toggleMouseEvents()
	})

	// Register escape key to exit the app
	globalShortcut.register('Escape', () => {
		app.quit()
	})

	// Set up IPC to allow renderer to toggle mouse events
	ipcMain.on('toggle-mouse-events', () => {
		toggleMouseEvents()
	})

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

// Function to toggle mouse events
function toggleMouseEvents() {
	if (mainWindow) {
		isIgnoringMouseEvents = !isIgnoringMouseEvents
		mainWindow.setIgnoreMouseEvents(isIgnoringMouseEvents, { forward: true })

		// Notify renderer process about the change
		mainWindow.webContents.send('toggle-mouse-updated', !isIgnoringMouseEvents)
	}
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
