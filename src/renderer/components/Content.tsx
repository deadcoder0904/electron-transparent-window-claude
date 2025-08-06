import React from 'react'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

export default function Content() {
	// Render panels side-by-side in a horizontal flex row that fills available space.
	// Parent (App) positions this container below the top bar; we only manage the row layout here.
	return (
		<div className='flex w-full h-full'>
			<LeftPanel />
			<RightPanel />
		</div>
	)
}
