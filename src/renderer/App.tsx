import React from 'react'
import Content from './components/Content'
import TopBar from './components/TopBar'
import { useClickThroughGuard } from './hooks/useClickThroughGuard'
import './styles/main.css'

export default function App() {
	useClickThroughGuard()

	return (
		<>
			<TopBar />
			<div className='fixed inset-0 pt-[var(--bar-height)] z-[1]'>
				<Content />
			</div>
		</>
	)
}
