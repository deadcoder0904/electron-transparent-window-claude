import React from 'react'

export default function LeftPanel() {
	return (
		<div
			id='left'
			className="relative flex-1 p-6 box-border border-r border-divider shadow-[12px_0_24px_-20px_rgba(0,0,0,0.8)] bg-panel [backdrop-filter:blur(var(--section-blur))_saturate(1.05)] before:content-[''] before:absolute before:inset-0 before:[border-top:1px_solid_rgba(255,255,255,0.06)] before:[border-bottom:1px_solid_rgba(255,255,255,0.04)] before:shadow-[inset_0_0_0_1px_rgba(122,92,255,0.12)] before:pointer-events-none"
		>
			<h2 className="inline-flex items-center gap-2 m-0 mb-3 text-[14px] font-bold uppercase tracking-[0.12em] text-muted after:content-[''] after:inline-block after:w-[66px] after:h-px after:bg-[linear-gradient(90deg,transparent,var(--glow),transparent)] after:[filter:drop-shadow(0_0_3px_rgba(0,255,209,0.5))]">
				LEFT
			</h2>
			<blockquote className='my-3 py-3 rounded-lg pl-[14px] border-l-2 shadow-[inset_0_0_0_1px_rgba(122,92,255,0.18)] text-body bg-[rgba(122,92,255,0.08)] border-l-neon-2'>
				“Suffering sharpens the soul.”
			</blockquote>
			<blockquote className='my-3 py-3 rounded-lg pl-[14px] border-l-2 shadow-[inset_0_0_0_1px_rgba(122,92,255,0.18)] text-body bg-[rgba(122,92,255,0.08)] border-l-neon-2'>
				“Endure pain as a teacher, not a jailer.”
			</blockquote>
			<blockquote className='my-3 py-3 rounded-lg pl-[14px] border-l-2 shadow-[inset_0_0_0_1px_rgba(122,92,255,0.18)] text-body bg-[rgba(122,92,255,0.08)] border-l-neon-2'>
				“Through each hardship, wisdom grows.”
			</blockquote>
		</div>
	)
}
