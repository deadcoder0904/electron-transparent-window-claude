// src/renderer/main.ts
import { BrowserWindow } from '@electron/remote'

document.addEventListener('DOMContentLoaded', () => {
	const win = BrowserWindow.getFocusedWindow()
	let isClickable = false

	const toggleButton = document.getElementById(
		'toggleInteraction',
	) as HTMLButtonElement
	const exitButton = document.getElementById('exit') as HTMLButtonElement

	if (toggleButton && exitButton) {
		toggleButton.addEventListener('click', () => {
			isClickable = !isClickable
			if (win) {
				win.setIgnoreMouseEvents(isClickable, { forward: true })
				toggleButton.textContent = isClickable
					? 'Disable Mouse'
					: 'Enable Mouse'
			}
		})

		exitButton.addEventListener('click', () => {
			window.close()
		})
	}
})
