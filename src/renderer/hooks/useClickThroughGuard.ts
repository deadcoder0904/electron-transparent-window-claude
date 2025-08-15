// src/renderer/hooks/useClickThroughGuard.ts
import { useEffect } from 'react'
import { useInteractivity } from './useInteractivity'

// Keeps window click-through except over elements marked interactive
// Mark interactive regions with: data-interactive="true" or class "interactive"
export function useClickThroughGuard() {
	const isInteractive = useInteractivity()

	useEffect(() => {
		const api = (window as any).electronAPI
		if (!api || typeof api.setMouseIgnore !== 'function') {
			return () => {}
		}
		let lastIgnore = false
		let lastX: number | null = null
		let lastY: number | null = null

		const setIgnore = (ignore: boolean) => {
			if (ignore === lastIgnore) return
			lastIgnore = ignore
			try {
				api.setMouseIgnore(ignore)
			} catch {}
		}

		const isElementInteractive = (el: Element | null): boolean => {
			if (!el) return false
			return !!(el.closest('[data-interactive="true"]') ||
				el.closest('.interactive'))
		}

		// Check if we're over an interactive element (works without pointer movement)
		const computeHoveringInteractive = (): boolean => {
			// 1) Try CSS :hover chain (works without movement)
			const hovered = document.querySelectorAll(':hover')
			if (hovered.length) {
				const deepest = hovered[hovered.length - 1] as Element
				if (isElementInteractive(deepest)) return true
				// Also consider ancestors
				if (deepest.closest('[data-interactive="true"], .interactive')) {
					return true
				}
			}

			// Fallback: elementsFromPoint if we have recent pointer position
			if (lastX != null && lastY != null) {
				const els = document.elementsFromPoint(lastX, lastY)
				for (const el of els) {
					if (el instanceof Element && isElementInteractive(el)) return true
				}
			}

			return false
		}

		const onPointerMove = (e: PointerEvent) => {
			lastX = e.clientX
			lastY = e.clientY

			if (isInteractive) {
				setIgnore(false)
				return
			}
			const hovering = !!(e.target && e.target instanceof Element &&
				isElementInteractive(e.target))
			setIgnore(!hovering)
		}

		const onPointerLeave = () => {
			if (!isInteractive) setIgnore(true)
		}

		const applyNow = () => {
			if (isInteractive) setIgnore(false)
			else setIgnore(!computeHoveringInteractive())
		}

		// Initial apply and again on next frame to avoid timing races
		applyNow()
		requestAnimationFrame(applyNow)

		// Re-evaluate when window regains focus or visibility changes
		const onFocusOrVisibility = () => applyNow()
		window.addEventListener('focus', onFocusOrVisibility)
		document.addEventListener('visibilitychange', onFocusOrVisibility)

		// Track pointer
		document.addEventListener('pointermove', onPointerMove, { passive: true })
		document.addEventListener('pointerleave', onPointerLeave, { passive: true })

		return () => {
			window.removeEventListener('focus', onFocusOrVisibility)
			document.removeEventListener('visibilitychange', onFocusOrVisibility)
			document.removeEventListener('pointermove', onPointerMove)
			document.removeEventListener('pointerleave', onPointerLeave)
			// Leave window interactive on cleanup
			setIgnore(false)
		}
	}, [isInteractive])
}
