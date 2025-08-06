import React from 'react'
import TopBar from './components/TopBar'
import Content from './components/Content'
import { useInteractiveOverlay } from './hooks/useInteractiveOverlay'

export default function App() {
	const topBarRef = React.useRef<HTMLDivElement | null>(null)
	const toggleBtnRef = React.useRef<HTMLButtonElement | null>(null)
	const exitBtnRef = React.useRef<HTMLButtonElement | null>(null)
	const stateIndicatorRef = React.useRef<HTMLSpanElement | null>(null)

	const { isInteractive } = useInteractiveOverlay({
		topBarRef,
		toggleBtnRef,
		exitBtnRef,
		stateIndicatorRef,
	})

	return (
		<>
			<TopBar
				topBarRef={topBarRef}
				toggleBtnRef={toggleBtnRef}
				exitBtnRef={exitBtnRef}
				stateIndicatorRef={stateIndicatorRef}
				isInteractive={isInteractive}
			/>
			{/* Content area directly below top bar; fills remaining viewport height */}
			<div className='fixed inset-x-0 bottom-0 top-[var(--bar-height)] z-[1]'>
				<Content />
			</div>
		</>
	)
}
