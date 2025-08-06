export interface ElectronAPI {
	// Existing methods (keep as-is)
	toggleMouseEvents: () => void
	onToggleMouseUpdated: (callback: (state: boolean) => void) => void

	// Additional methods used by the renderer (additive, non-breaking)
	exit?: () => void
	setIgnoreMouseEvents?: (
		ignore: boolean,
		options?: { forward?: boolean },
	) => void
	updateInteractiveRegions?: (
		rects: Array<{ x: number; y: number; width: number; height: number }>,
	) => void
	onRequestInteractiveRegions?: (callback: () => void) => void
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
