// src/renderer/components/TopBarButton.tsx
import React from 'react'

type Props = {
	id: string
	onClick: () => void
	'aria-label': string
	children: React.ReactNode
	className?: string
}

// Styled button for the top bar
export function TopBarButton({
	id,
	onClick,
	children,
	className,
	...rest
}: Props) {
	const buttonClasses = `
    text-[13px] rounded-md cursor-pointer px-[14px] py-2 border 
    transition-all duration-200 ease-out 
    shadow-[var(--shadow-btn-inset),var(--shadow-btn-base)] 
    text-btn-text border-btn-border bg-[var(--gradient-btn)] 
    hover:border-neon/60 hover:shadow-[var(--shadow-btn-hover)] 
    active:translate-y-px
    ${className || ''}
  `

	return (
		<button
			id={id}
			onClick={onClick}
			className={buttonClasses.trim()}
			type='button'
			data-interactive='true'
			{...rest}
		>
			{children}
		</button>
	)
}
