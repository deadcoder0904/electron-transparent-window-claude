// src/renderer/hooks/useInteractivity.ts
import { useEffect, useState } from 'react'

/**
 * Custom hook to subscribe to the application's interactive state.
 *
 * @returns {boolean} The current interactive state (true = interactive, false = click-through).
 */
export function useInteractivity(): boolean {
	const [isInteractive, setIsInteractive] = useState(true)

	useEffect(() => {
		// Subscribe to updates from the main process.
		const unsubscribe = window.electronAPI.onToggleMouseUpdated(
			(newIsInteractive) => {
				setIsInteractive(newIsInteractive)
			},
		)

		// The cleanup function is returned by onToggleMouseUpdated,
		// ensuring we unsubscribe when the component unmounts.
		return () => unsubscribe()
	}, []) // Empty dependency array ensures this runs only once.

	return isInteractive
}
