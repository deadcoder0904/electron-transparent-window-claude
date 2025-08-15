import React from 'react'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

export default function Content() {
	return (
		<div className='flex w-full h-full'>
			<LeftPanel />
			<RightPanel />
		</div>
	)
}
