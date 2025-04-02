// main.js
const { app, BrowserWindow, screen } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.setIgnoreMouseEvents(true, { forward: true });
	mainWindow.loadFile("index.html");

	// Optional: Add global shortcut to exit the app
	const { globalShortcut } = require("electron");
	globalShortcut.register("Escape", () => {
		app.quit();
	});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
