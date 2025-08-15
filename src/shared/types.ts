export interface ElectronAPI {
	toggleMouseEvents: () => void
	onToggleMouseUpdated: (callback: (state: boolean) => void) => () => void
	increaseOpacity: () => void
	decreaseOpacity: () => void
	// Set global mouse ignore (with { forward: true })
	setMouseIgnore: (ignore: boolean) => void
	exit: () => void
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
