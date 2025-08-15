// src/shared/constants.ts
export const SHORTCUTS = {
	TOGGLE_MOUSE: 'CommandOrControl+Shift+M',
	EXIT: 'Escape',
	OPACITY_DECREASE: 'CommandOrControl+[',
	OPACITY_INCREASE: 'CommandOrControl+]',
}

export const CHANNELS = {
	TOGGLE_MOUSE: 'toggle-mouse-events',
	MOUSE_UPDATED: 'toggle-mouse-updated',
	OPACITY_INCREASE: 'opacity-increase',
	OPACITY_DECREASE: 'opacity-decrease',
	SET_MOUSE_IGNORE: 'set-mouse-ignore',
}

export const LABELS = {
	ENABLE: 'Enable Click-Through (⌘⇧M)',
	DISABLE: 'Disable Click-Through (⌘⇧M)',
	EXIT: 'Exit (ESC)',
	OPACITY_DECREASE: 'Decrease Opacity (⌘[)',
	OPACITY_INCREASE: 'Increase Opacity (⌘])',
}

// Opacity step used by shortcuts and IPC handlers
export const OPACITY_STEP = 0.1
