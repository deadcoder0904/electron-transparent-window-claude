# Electron Transparent Overlay

A transparent overlay application built with Electron and React that allows you
to interact with content underneath while maintaining control through a
persistent top bar.

## What This Project Does

This application creates a transparent overlay window that can switch between
interactive and click-through modes, allowing you to select and interact with
content behind the overlay. The app consists of two main components:

1. **Top Bar**: Always interactive control panel with buttons and shortcuts
2. **Content Area**: Transparent overlay that can be made click-through

### Key Features

- **Transparent Overlay**: Semi-transparent window that sits on top of other
  applications
- **Click-Through Mode**: Toggle between interactive and click-through states
- **Opacity Control**: Adjust transparency levels to see content underneath
- **Always On Top**: Stays above other windows for consistent access
- **Global Shortcuts**: Control the app from anywhere using keyboard shortcuts

## How to Use Click-Through Functionality

To select text or interact with content behind the overlay, follow these steps:

1. **Decrease Opacity**: Use `CMD+[` to reduce the overlay opacity until you can
   clearly see the content underneath
2. **Enable Click-Through**: Press `CMD+SHIFT+M` to toggle the overlay into
   click-through mode
3. **Select Content**: Click and drag to select text or interact with
   applications behind the overlay
4. **Return to Interactive**: Press `CMD+SHIFT+M` again to regain control of the
   overlay

### Keyboard Shortcuts

- `CMD+SHIFT+M`: Toggle between interactive and click-through modes
- `CMD+[`: Decrease opacity
- `CMD+]`: Increase opacity
- `ESC`: Exit application

## Installation

Download [Bun](https://bun.sh).

```bash
bun install
```

## Usage

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
```

And then open up the `electron-transparent-overlay.app` in `release/mac-arm64`
folder.
