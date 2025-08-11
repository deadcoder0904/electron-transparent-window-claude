export interface ElectronAPI {
  toggleMouseEvents: () => void
  onToggleMouseUpdated: (callback: (state: boolean) => void) => () => void
  increaseOpacity: () => void
  decreaseOpacity: () => void
  exit: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
