// src/renderer/components/LeftPanel.tsx
import React from 'react'
import { PanelSection } from './PanelSection'

/**
 * A styled quote component for the left panel.
 */
function Quote({ children }: { children: React.ReactNode }) {
  const quoteClasses = `
    my-3 py-3 rounded-lg pl-[14px] border-l-2 
    shadow-[inset_0_0_0_1px_theme(colors.neon-2/18%)] 
    text-body bg-neon-2/8 border-l-neon-2
  `
  return <blockquote className={quoteClasses.trim()}>{children}</blockquote>
}

/**
 * The left panel of the content window, displaying a series of quotes.
 */
export default function LeftPanel() {
  return (
    <PanelSection id="left" title="LEFT">
      <Quote>“Suffering sharpens the soul.”</Quote>
      <Quote>“Endure pain as a teacher, not a jailer.”</Quote>
      <Quote>“Through each hardship, wisdom grows.”</Quote>
    </PanelSection>
  )
}
