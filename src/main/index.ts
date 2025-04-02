// src/main/index.ts
import { app, BrowserWindow, globalShortcut, screen } from 'electron'
import path from 'path'
import { enable, initialize } from '@electron/remote/main'

// Initialize @electron/remote
initialize()

let mainWindow: BrowserWindow | null = null

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
			preload: path.join(__dirname, '../preload/index.js'),
		},
	})

	// Enable remote module for this window
	if (mainWindow) {
		enable(mainWindow.webContents)
	}

	mainWindow.setIgnoreMouseEvents(true, { forward: true })

	// Load the index.html file
	if (process.env.NODE_ENV === 'development') {
		// Dev - load from Vite dev server
		mainWindow.loadURL('http://localhost:5173')
	} else {
		// Production - load the built index.html
		mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
	}

	// Optional: Add global shortcut to exit the app
	globalShortcut.register('Escape', () => {
		app.quit()
	})

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

app.whenReady().then(createWindow)

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
