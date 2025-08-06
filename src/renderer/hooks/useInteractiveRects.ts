import React from 'react'

/** Hook: measures DOM rects (in physical pixels) for given elements */
export function useInteractiveRects() {
	const rectInPixels = React.useCallback((el: HTMLElement) => {
		const r = el.getBoundingClientRect()
		const dpr = window.devicePixelRatio || 1
		return {
			x: Math.round(r.left * dpr),
			y: Math.round(r.top * dpr),
			width: Math.round(r.width * dpr),
			height: Math.round(r.height * dpr),
		}
	}, [])

	const getRects = React.useCallback(
		(elements: Array<HTMLElement | null>) => {
			const regions: Array<{
				x: number
				y: number
				width: number
				height: number
			}> = []
			elements.forEach((el) => {
				if (el) regions.push(rectInPixels(el))
			})
			return regions
		},
		[rectInPixels],
	)

	return { rectInPixels, getRects }
}
