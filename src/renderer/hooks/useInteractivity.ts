// src/renderer/hooks/useInteractivity.ts
import { useEffect, useState } from 'react'

// Subscribe to the app's interactive state
export function useInteractivity(): boolean {
	const [isInteractive, setIsInteractive] = useState(true)

	useEffect(() => {
		// Subscribe to updates from the main process.
		const unsubscribe = window.electronAPI.onToggleMouseUpdated(
			(newIsInteractive) => {
				setIsInteractive(newIsInteractive)
			},
		)

		// Unsubscribe on unmount.
		return unsubscribe
	}, []) // Empty dependency array ensures this runs only once.

	return isInteractive
}
