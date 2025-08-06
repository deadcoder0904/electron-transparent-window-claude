# Refactoring Plan: Two-Window Architecture for Transparent Overlay

## 1. Objective

The goal of this refactoring is to fix the bug where the top-bar buttons become
unclickable when the application is in "click-through" mode. We will achieve
this by splitting the current single-window application into a two-window
architecture:

1. **`topBarWindow`**: A small, always-interactive window at the top for
   controls.
2. **`contentWindow`**: A large, click-through window for displaying content
   underneath the top bar.

This approach uses Electron's standard features to correctly separate
interactive and non-interactive areas.

---

## 2. Detailed Implementation Steps

### Step 1: Main Process Refactoring (`src/main/index.ts`)

The main process will be updated to create and manage two separate
`BrowserWindow` instances.

1. **Update Window Variables:**
   - Replace the single `mainWindow` variable with two distinct variables to
     hold references to our new windows.
   ```typescript
   // Remove this line
   let mainWindow: BrowserWindow | null = null

   // Add these lines
   let topBarWindow: BrowserWindow | null = null
   let contentWindow: BrowserWindow | null = null
   ```

2. **Modify the `createWindows` Function (previously `createWindow`):**
   - This function will now orchestrate the creation of both windows.

   - **Create `topBarWindow`:**
     - **Dimensions:** Full screen width, fixed height (e.g., `60px`).
     - **Properties:** `frame: false`, `transparent: true`, `alwaysOnTop: true`.
     - **Interactivity:** It will **remain interactive**. We will not call
       `setIgnoreMouseEvents` on it.
     - **Content:** It will load a new HTML file, `top-bar.html`.
     - **WebPreferences:** It needs a `preload` script to communicate with the
       main process.

   - **Create `contentWindow`:**
     - **Dimensions:** Full screen width, and height equal to
       `screenHeight - topBarHeight`.
     - **Position:** Placed directly below the `topBarWindow`.
     - **Properties:** `frame: false`, `transparent: true`, `alwaysOnTop: true`.
     - **Interactivity:** It will be **click-through by default**. We will call
       `contentWindow.setIgnoreMouseEvents(true, { forward: true })` immediately
       after creation.
     - **Content:** It will load the existing `index.html`.

3. **Update Event Handling:**
   - **IPC `toggle-mouse-events`:** This listener will now only toggle the mouse
     events for `contentWindow`.
   - **Global Shortcuts:** Opacity and quit shortcuts should apply to both
     windows to maintain a unified feel.
   - **Cleanup:** The `update-interactive-regions` IPC listener is now obsolete
     and must be **removed**.
   - Window closure handlers (`on('closed')`) need to be updated to nullify both
     `topBarWindow` and `contentWindow`.

### Step 2: Create New HTML for the Top Bar

1. **Create `src/renderer/top-bar.html`:**
   - This file will contain only the HTML for the top control bar.
   - **Copy** the `<div id="top-bar">...</div>` element from the current
     `src/renderer/index.html` into this new file.
   - **Copy** all CSS rules related to `#top-bar` and its children from the
     `<style>` block of `index.html` into a new `<style>` block in
     `top-bar.html`.
   - Add a script tag to load its dedicated logic:
     `<script type="module" src="/top-bar.ts"></script>`.

### Step 3: Create New Script for the Top Bar

1. **Create `src/renderer/top-bar.ts`:**
   - This script will manage the interactivity of `top-bar.html`.
   - **Move** the JavaScript logic for the toggle and exit buttons from the
     `<script>` tag in `index.html` to this file.
   - This script will use the `electronAPI` (exposed by the preload script) to:
     - Call `electronAPI.toggleMouseEvents()` on button click.
     - Call `electronAPI.exit()` on exit button click.
     - Listen for `electronAPI.onToggleMouseUpdated()` to update the button's
       text.

### Step 4: Clean Up Existing Renderer Files

1. **Modify `src/renderer/index.html`:**
   - **Remove** the `<div id="top-bar">...</div>` element completely.
   - **Remove** all CSS associated with `#top-bar` from the `<style>` block.
   - **Remove** the entire `<script type="module">...</script>` block at the end
     of the file. This window will now be purely for content display and
     requires no script.

2. **Delete `src/renderer/app.ts`:**
   - This file is no longer needed as its logic has been moved to `top-bar.ts`
     or is obsolete.

### Step 5: Simplify the Preload Script (`src/preload/index.ts`)

The preload script will be shared by both windows.

1. **Update `electronAPI`:**
   - **Remove** the `updateInteractiveRegions` and `onRequestInteractiveRegions`
     functions from the `contextBridge.exposeInMainWorld` call. They are no
     longer used in the two-window model.

### Step 6: Configure Vite for a Multi-Page App (`electron.vite.config.ts`)

We must inform Vite that we now have two separate entry points for the renderer.

1. **Modify `renderer.build.rollupOptions`:**
   - Update the `renderer` configuration to specify multiple inputs for the
     build process.

   ```typescript
   // electron.vite.config.ts

   export default defineConfig({
   	// ... main and preload configs
   	renderer: {
   		// The root is still the same
   		root: path.join(__dirname, 'src/renderer'),
   		build: {
   			outDir: path.join(__dirname, 'dist/renderer'),
   			// Add rollupOptions to define multiple entry points
   			rollupOptions: {
   				input: {
   					// 'main' is the key for the main content window
   					main: path.join(__dirname, 'src/renderer/index.html'),
   					// 'top-bar' is the key for the new top bar window
   					'top-bar': path.join(__dirname, 'src/renderer/top-bar.html'),
   				},
   			},
   		},
   	},
   })
   ```

---

## 3. Expected Outcome

After implementing these changes, the application will launch two windows that
appear as one. The top bar will remain interactive, allowing button clicks and
dragging, while the content area below it will be click-through, allowing
interaction with the desktop and applications underneath. The toggle shortcut
will correctly control the interactivity of the content area only.
