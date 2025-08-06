import React, { useCallback, useState } from 'react'
import { useInteractiveRects } from './useInteractiveRects'

type ElectronAPI = {
	getPlatform?: () => string
	toggleMouseEvents?: () => void
	setIgnoreMouseEvents?: (
		ignore: boolean,
		options?: { forward?: boolean },
	) => void
	updateInteractiveRegions?: (
		regions: Array<{ x: number; y: number; width: number; height: number }>,
	) => void
	exit?: () => void
	onToggleMouseUpdated?: (handler: (interactive: boolean) => void) => void
	onRequestInteractiveRegions?: (handler: () => void) => void
}

declare global {
	interface Window {
		electronAPI?: ElectronAPI
	}
}

export type OverlayRefs = {
	topBarRef: React.RefObject<HTMLDivElement | null>
	toggleBtnRef: React.RefObject<HTMLButtonElement | null>
	exitBtnRef: React.RefObject<HTMLButtonElement | null>
	stateIndicatorRef: React.RefObject<HTMLSpanElement | null>
}

/** Hook: centralizes interactive overlay state and IPC bindings */
export function useInteractiveOverlay({
	topBarRef,
	toggleBtnRef,
	exitBtnRef,
	stateIndicatorRef,
}: OverlayRefs) {
	const [isInteractive, setIsInteractive] = useState(true)
	const overlayInteractiveRef = React.useRef<boolean>(true)
	const lastTransparentRef = React.useRef<boolean | null>(null)
	const clickThroughActiveRef = React.useRef<boolean>(false)

	const updateUI = useCallback((interactive: boolean) => {
		setIsInteractive(interactive)
	}, [])

	const { rectInPixels, getRects } = useInteractiveRects()

	const getInteractiveRects = React.useCallback(() => {
		const bar = topBarRef.current
		const toggle = toggleBtnRef.current
		const exit = exitBtnRef.current

		const regions: Array<{
			x: number
			y: number
			width: number
			height: number
		}> = []
		if (bar) regions.push(rectInPixels(bar))
		regions.push(...getRects([toggle, exit]))
		return regions
	}, [exitBtnRef, getRects, rectInPixels, toggleBtnRef, topBarRef])

	// Debounced sender for region updates (reduces IPC frequency on resize/mutations)
	const sendInteractiveRegions = React.useCallback(() => {
		window.electronAPI?.updateInteractiveRegions?.(getInteractiveRects())
	}, [getInteractiveRects])

	// Toggle button click
	React.useEffect(() => {
		const toggleBtn = toggleBtnRef.current
		const api = window.electronAPI

		if (toggleBtn && api && typeof api.toggleMouseEvents === 'function') {
			const onClick = () => api.toggleMouseEvents?.()
			toggleBtn.addEventListener('click', onClick)
			return () => toggleBtn.removeEventListener('click', onClick)
		}
		return
	}, [toggleBtnRef])

	// Exit button click
	React.useEffect(() => {
		const exitBtn = exitBtnRef.current
		if (!exitBtn) return

		const onClick = () => window.electronAPI?.exit?.()
		exitBtn.addEventListener('click', onClick)
		return () => exitBtn.removeEventListener('click', onClick)
	}, [exitBtnRef])

	// Subscribe to onToggleMouseUpdated and drive state + ignoreMouseEvents
	React.useEffect(() => {
		const api = window.electronAPI
		if (!api || typeof api.onToggleMouseUpdated !== 'function') return

		const handler = (interactive: boolean) => {
			overlayInteractiveRef.current = interactive
			updateUI(interactive)

			window.electronAPI?.setIgnoreMouseEvents?.(!interactive, {
				forward: true,
			})

			clickThroughActiveRef.current = !interactive
		}

		api.onToggleMouseUpdated?.(handler)
		return () => {
			// If an off method exists, add cleanup here, e.g.: api.offToggleMouseUpdated?.(handler)
		}
	}, [updateUI])

	// Initialize UI and send regions once mounted; update on resize (debounced)
	React.useEffect(() => {
		updateUI(overlayInteractiveRef.current)
		sendInteractiveRegions()

		let timeout: number | undefined
		const onResize = () => {
			if (timeout) clearTimeout(timeout)
			// 100ms debounce
			timeout = window.setTimeout(() => {
				sendInteractiveRegions()
				timeout = undefined
			}, 100)
		}
		window.addEventListener('resize', onResize)
		return () => {
			window.removeEventListener('resize', onResize)
			if (timeout) clearTimeout(timeout)
		}
	}, [sendInteractiveRegions, updateUI])

	// Forward interactive regions when top bar children change
	React.useEffect(() => {
		const topBar = topBarRef.current
		if (!topBar) return

		let timeout: number | undefined
		const observer = new MutationObserver(() => {
			if (timeout) clearTimeout(timeout)
			// debounce 100ms
			timeout = window.setTimeout(() => {
				sendInteractiveRegions()
				timeout = undefined
			}, 100)
		})
		observer.observe(topBar, {
			childList: true,
			subtree: false, // limit observation scope for performance
			attributes: false,
		})
		return () => {
			observer.disconnect()
			if (timeout) clearTimeout(timeout)
		}
	}, [sendInteractiveRegions, topBarRef])

	// Use pointerenter/leave to control ignore state when click-through is active
	React.useEffect(() => {
		const handlePointerEnter = () => {
			if (!overlayInteractiveRef.current) {
				window.electronAPI?.setIgnoreMouseEvents?.(false)
			}
		}

		const handlePointerLeave = () => {
			if (!overlayInteractiveRef.current) {
				window.electronAPI?.setIgnoreMouseEvents?.(true, { forward: true })
			}
		}

		const interactiveElements = [
			topBarRef.current,
			toggleBtnRef.current,
			exitBtnRef.current,
		].filter(Boolean) as HTMLElement[]

		interactiveElements.forEach((el) => {
			el.addEventListener('pointerenter', handlePointerEnter)
			el.addEventListener('pointerleave', handlePointerLeave)
		})

		return () => {
			interactiveElements.forEach((el) => {
				el.removeEventListener('pointerenter', handlePointerEnter)
				el.removeEventListener('pointerleave', handlePointerLeave)
			})
		}
	}, [topBarRef, toggleBtnRef, exitBtnRef])

	// Removed mousemove scanning in favor of targeted pointer events for performance

	// Handle onRequestInteractiveRegions bridge
	React.useEffect(() => {
		const api = window.electronAPI
		if (!api || typeof api.onRequestInteractiveRegions !== 'function') return

		api.onRequestInteractiveRegions?.(sendInteractiveRegions)
	}, [sendInteractiveRegions])

	return {
		isInteractive,
		overlayInteractiveRef,
		clickThroughActiveRef,
		lastTransparentRef,
		sendInteractiveRegions,
	}
}
