// src/renderer/components/PanelSection.tsx
import React from 'react'

type Props = {
	id: 'left' | 'right'
	title: string
	children: React.ReactNode
}

// Styled container for a content panel section
export function PanelSection({ id, title, children }: Props) {
	let panelClasses = `
    relative flex-1 p-6 bg-panel
    backdrop-blur-[var(--section-blur)] backdrop-saturate-105
    before:content-[''] before:absolute before:inset-0 
    before:border-t before:border-t-white/6
    before:border-b before:border-b-white/4
    before:shadow-[inset_0_0_0_1px_theme(colors.neon-2/12%)] 
    before:pointer-events-none
  `

	const titleClasses = `
    inline-flex items-center gap-2 m-0 mb-3 text-sm font-bold 
    uppercase tracking-[0.12em] text-muted 
    after:content-[''] after:inline-block after:w-[66px] after:h-px 
    after:bg-gradient-to-r after:from-transparent after:via-neon after:to-transparent
    after:drop-shadow-[0_0_3px_theme(colors.neon/50%)]
  `

	// Add a right border only to the left panel.
	if (id === 'left') {
		panelClasses +=
			' border-r border-divider shadow-[12px_0_24px_-20px_rgba(0,0,0,0.8)]'
	}

	return (
		<section id={id} className={panelClasses.trim()}>
			<h2 className={titleClasses.trim()}>{title}</h2>
			{children}
		</section>
	)
}
