// src/renderer/components/CodeBlock.tsx
import React from 'react'

type Props = {
  code: string
  language: string
}

/**
 * A styled component for displaying blocks of pre-formatted code.
 */
export function CodeBlock({ code, language }: Props) {
  const containerClasses = `
    m-0 px-4 py-[14px] rounded-[10px] text-code-fg overflow-x-auto 
    relative shadow-[var(--shadow-code)] bg-[var(--gradient-code)]
  `

  return (
    <pre
      className={containerClasses.trim()}
      aria-label={`Code block: ${language}`}
    >
      <code className="font-mono text-[12.5px] leading-[1.55]">{code}</code>
    </pre>
  )
}
