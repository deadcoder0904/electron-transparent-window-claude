import React from 'react'

type Refs = {
	topBarRef: React.RefObject<HTMLDivElement | null>
	toggleBtnRef: React.RefObject<HTMLButtonElement | null>
	exitBtnRef: React.RefObject<HTMLButtonElement | null>
	stateIndicatorRef: React.RefObject<HTMLSpanElement | null>
	isInteractive: boolean
}

/**
 * Top bar shows current interactivity and exposes controls.
 * Button label and state indicator now derive from React state (isInteractive).
 */
export default function TopBar({
	topBarRef,
	toggleBtnRef,
	exitBtnRef,
	stateIndicatorRef,
	isInteractive,
}: Refs) {
	return (
		<div
			id='top-bar'
			ref={topBarRef}
			className='topbar-neo flex items-center gap-2 px-4 py-1 select-none'
		>
			<button
				id='toggle-btn'
				ref={toggleBtnRef}
				className='text-[13px] rounded-md cursor-pointer px-[14px] py-2 border transition-[border-color,box-shadow,transform,background] duration-200 ease-out shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),var(--shadow-btn-base)] text-btn-text border-btn-border bg-[var(--gradient-btn)] hover:border-[rgba(0,255,209,0.6)] hover:shadow-[var(--shadow-btn-hover)] active:translate-y-px'
				type='button'
				aria-label='Toggle Click-Through (Cmd+Shift+M)'
			>
				{isInteractive
					? 'Disable Click‑Through (⌘⇧M)'
					: 'Enable Click‑Through (⌘⇧M)'}
			</button>
			<span
				id='state-indicator'
				ref={stateIndicatorRef}
				className='ml-2 text-xs uppercase tracking-[0.06em] text-muted'
				aria-live='polite'
			>
				State: {isInteractive ? 'Interactive' : 'Click‑Through'}
			</span>
			{window.electronAPI?.getPlatform?.() === 'darwin' && (
				<div className='text-xs text-yellow-400 ml-4'>
					macOS: Click-through applies to entire window
				</div>
			)}
			<button
				id='exit-btn'
				ref={exitBtnRef}
				className='ml-auto text-[13px] rounded-md cursor-pointer px-[14px] py-2 border transition-[border-color,box-shadow,transform,background] duration-200 ease-out shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),var(--shadow-btn-base)] text-btn-text border-btn-border bg-[var(--gradient-btn)] hover:border-[rgba(0,255,209,0.6)] hover:shadow-[var(--shadow-btn-hover)] active:translate-y-px'
				type='button'
			>
				Exit (ESC)
			</button>
		</div>
	)
}
