export interface ElectronAPI {
	toggleMouseEvents: () => void
	onToggleMouseUpdated: (callback: (state: boolean) => void) => void
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
