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
import { enable, initialize } from '@electron/remote/main'
import { CHANNELS } from '../shared/constants'

// Initialize @electron/remote
initialize()

const TOP_BAR_HEIGHT = 56

// --- State Management ---
const state = {
  windows: {
    topBar: null as BrowserWindow | null,
    content: null as BrowserWindow | null,
  },
  isInteractive: true, // true = interactive, false = click-through
}

// --- Window Creation ---

/**
 * Creates the always-on-top, interactive top bar window.
 */
function createTopBarWindow(bounds: Rectangle): BrowserWindow {
  const window = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: true,
    resizable: false,
    fullscreenable: false,
    movable: false,
    skipTaskbar: true,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.mjs'),
    },
  })
  enable(window.webContents)
  window.on('closed', () => (state.windows.topBar = null))
  return window
}

/**
 * Creates the content window, which can be made click-through.
 */
function createContentWindow(bounds: Rectangle): BrowserWindow {
  const window = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: true,
    show: true,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.mjs'),
    },
  })
  enable(window.webContents)
  window.setIgnoreMouseEvents(false) // Start interactive
  window.on('closed', () => (state.windows.content = null))
  return window
}

// --- Core Logic ---

/**
 * Toggles the interactivity of the content window.
 */
function toggleInteractivity() {
  const { content } = state.windows
  if (!content) return

  state.isInteractive = !state.isInteractive
  content.setIgnoreMouseEvents(!state.isInteractive, { forward: true })
  broadcastInteractiveState()
}

/**
 * Adjusts the opacity of the content window.
 */
function adjustContentOpacity(delta: number) {
  const { content } = state.windows
  if (!content) return

  const current = content.getOpacity()
  const next = Math.min(1, Math.max(0.1, Number((current + delta).toFixed(2))))
  content.setOpacity(next)
}

/**
 * Sends the current interactive state to both renderer processes.
 */
function broadcastInteractiveState() {
  const { topBar, content } = state.windows
  topBar?.webContents.send(CHANNELS.MOUSE_UPDATED, state.isInteractive)
  content?.webContents.send(CHANNELS.MOUSE_UPDATED, state.isInteractive)
}

/**
 * Recalculates and sets the bounds for both windows based on the primary display.
 */
function layoutWindows() {
  const { topBar, content } = state.windows
  if (!topBar || !content) return

  const primary = screen.getPrimaryDisplay()
  const { x, y, width, height } = primary.workArea

  topBar.setBounds({ x, y, width, height: TOP_BAR_HEIGHT })
  content.setBounds({
    x,
    y: y + TOP_BAR_HEIGHT,
    width,
    height: Math.max(0, height - TOP_BAR_HEIGHT),
  })
}

/**
 * Ensures the top bar window is always stacked above the content window.
 */
function ensureWindowStacking() {
  const { topBar, content } = state.windows
  content?.setAlwaysOnTop(true, 'floating')
  topBar?.setAlwaysOnTop(true, 'screen-saver') // Higher level than 'floating'
}

// --- Setup and Lifecycle ---

/**
 * Registers all IPC handlers for communication from renderer processes.
 */
function registerIpcHandlers() {
  ipcMain.on(CHANNELS.TOGGLE_MOUSE, toggleInteractivity)
  ipcMain.on(CHANNELS.OPACITY_INCREASE, () => adjustContentOpacity(0.1))
  ipcMain.on(CHANNELS.OPACITY_DECREASE, () => adjustContentOpacity(-0.1))
  ipcMain.on('exit-app', () => app.quit())
}

/**
 * Registers all global keyboard shortcuts.
 */
function registerGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+M', toggleInteractivity)
  globalShortcut.register('Escape', () => app.quit())
  globalShortcut.register('CommandOrControl+[', () =>
    adjustContentOpacity(-0.1)
  )
  globalShortcut.register('CommandOrControl+]', () => adjustContentOpacity(0.1))
}

/**
 * Registers listeners for display events to handle screen changes.
 */
function registerScreenEventListeners() {
  const onDisplayChange = () => {
    layoutWindows()
    ensureWindowStacking()
  }
  screen.on('display-metrics-changed', onDisplayChange)
  screen.on('display-added', onDisplayChange)
  screen.on('display-removed', onDisplayChange)
}

/**
 * Creates the windows, loads the content, and sets initial state.
 */
function initializeApp() {
  const { workArea } = screen.getPrimaryDisplay()

  const topBarBounds = { ...workArea, height: TOP_BAR_HEIGHT }
  const contentBounds = {
    ...workArea,
    y: workArea.y + TOP_BAR_HEIGHT,
    height: workArea.height - TOP_BAR_HEIGHT,
  }

  state.windows.topBar = createTopBarWindow(topBarBounds)
  state.windows.content = createContentWindow(contentBounds)

  // Load renderer content
  const devUrl = (page: string) => `http://localhost:5173/${page}.html`
  const prodFile = (page: string) =>
    path.join(__dirname, `../renderer/${page}.html`)

  const topBarPath =
    process.env.NODE_ENV === 'development'
      ? devUrl('top-bar')
      : prodFile('top-bar')
  const contentPath =
    process.env.NODE_ENV === 'development' ? devUrl('index') : prodFile('index')

  if (process.env.NODE_ENV === 'development') {
    state.windows.topBar.loadURL(topBarPath)
    state.windows.content.loadURL(contentPath)
  } else {
    state.windows.topBar.loadFile(topBarPath)
    state.windows.content.loadFile(contentPath)
  }

  // Broadcast initial state after windows load
  state.windows.topBar.webContents.on(
    'did-finish-load',
    broadcastInteractiveState
  )
  state.windows.content.webContents.on(
    'did-finish-load',
    broadcastInteractiveState
  )

  ensureWindowStacking()
}

// --- App Lifecycle Events ---

app.whenReady().then(() => {
  initializeApp()
  registerIpcHandlers()
  registerGlobalShortcuts()
  registerScreenEventListeners()

  app.on('activate', () => {
    if (!state.windows.topBar && !state.windows.content) {
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
