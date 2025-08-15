// src/renderer/components/TopBar.tsx
import React from 'react'
import { useInteractivity } from '../hooks/useInteractivity'
import { LABELS } from '../../shared/constants'
import { TopBarButton } from './TopBarButton'
import '../styles/top-bar.css'

export default function TopBar() {
	const isInteractive = useInteractivity()

	const onToggle = () => window.electronAPI.toggleMouseEvents()
	const onIncreaseOpacity = () => window.electronAPI.increaseOpacity()
	const onDecreaseOpacity = () => window.electronAPI.decreaseOpacity()
	const onExit = () => window.electronAPI.exit()

	const toggleLabel = isInteractive ? LABELS.ENABLE : LABELS.DISABLE

	return (
		<div
			id='top-bar'
			className='topbar-neo gap-2 px-4 select-none'
			aria-label='Application Controls'
			role='toolbar'
			data-interactive='true'
		>
			<TopBarButton
				id='toggle-btn'
				onClick={onToggle}
				aria-label='Toggle Click-Through (Cmd+Shift+M)'
			>
				{toggleLabel}
			</TopBarButton>

			<span
				id='state-indicator'
				className='ml-2 text-xs uppercase tracking-wider text-muted'
				aria-live='polite'
			>
				State: {isInteractive ? 'Interactive' : 'Click-Through'}
			</span>

			<div className='flex gap-2 ml-auto' data-interactive='true'>
				<TopBarButton
					id='opacity-decrease-btn'
					onClick={onDecreaseOpacity}
					aria-label={LABELS.OPACITY_DECREASE}
				>
					{LABELS.OPACITY_DECREASE}
				</TopBarButton>
				<TopBarButton
					id='opacity-increase-btn'
					onClick={onIncreaseOpacity}
					aria-label={LABELS.OPACITY_INCREASE}
				>
					{LABELS.OPACITY_INCREASE}
				</TopBarButton>
				<TopBarButton id='exit-btn' onClick={onExit} aria-label={LABELS.EXIT}>
					{LABELS.EXIT}
				</TopBarButton>
			</div>
		</div>
	)
}
