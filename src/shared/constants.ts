// src/shared/constants.ts
export const SHORTCUTS = {
	TOGGLE_MOUSE: 'CommandOrControl+Shift+M',
	EXIT: 'Escape',
}

export const CHANNELS = {
	TOGGLE_MOUSE: 'toggle-mouse-events',
	MOUSE_UPDATED: 'toggle-mouse-updated',
	// Optional type-safe channels for dynamic regions
	UPDATE_INTERACTIVE: 'update-interactive-regions',
	REQUEST_INTERACTIVE: 'request-interactive-regions',
	// Directly set ignore state from renderer hover events
	SET_IGNORE: 'set-ignore-mouse-events',
}

export const LABELS = {
	ENABLE: 'Enable Mouse (⌘⇧M)',
	DISABLE: 'Disable Mouse (⌘⇧M)',
	EXIT: 'Exit (ESC)',
}
