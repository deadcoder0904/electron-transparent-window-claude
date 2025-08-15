// src/renderer/hooks/useInteractivity.ts
import { useEffect, useState } from 'react'

// Subscribe to the app's interactive state
export function useInteractivity(): boolean {
	const [isInteractive, setIsInteractive] = useState(true)

	useEffect(() => {
		const api = (window as any).electronAPI
		if (!api || typeof api.onToggleMouseUpdated !== 'function') {
			return () => {}
		}
		const unsubscribe = api.onToggleMouseUpdated(
			(newIsInteractive: boolean) => {
				setIsInteractive(newIsInteractive)
			},
		)
		return unsubscribe
	}, []) // Empty dependency array ensures this runs only once.

	return isInteractive
}
