// src/renderer/app.ts
import { LABELS } from '../shared/constants'

document.addEventListener('DOMContentLoaded', () => {
	let isClickable = false
	const elements = {
		toggleButton: document.getElementById(
			'toggleInteraction',
		) as HTMLButtonElement,
		exitButton: document.getElementById('exit') as HTMLButtonElement,
	}

	function updateUI(state: boolean) {
		isClickable = state
		elements.toggleButton.textContent = isClickable
			? LABELS.DISABLE
			: LABELS.ENABLE
		elements.toggleButton.classList.toggle('active', isClickable)
	}

	function setupEventListeners() {
		elements.toggleButton.addEventListener('click', () => {
			window.electronAPI.toggleMouseEvents()
		})

		elements.exitButton.addEventListener('click', () => {
			window.close()
		})

		window.electronAPI.onToggleMouseUpdated(updateUI)
	}

	if (elements.toggleButton && elements.exitButton) {
		setupEventListeners()
		updateUI(isClickable)
	}
})
