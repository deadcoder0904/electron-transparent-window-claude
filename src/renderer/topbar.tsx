// src/renderer/topbar.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { useInteractivity } from './hooks/useInteractivity'
import { TopBarButton } from './components/TopBarButton'
import './styles/top-bar.css'
import '../shared/types' // Ensures global types are loaded

/**
 * Renders the top bar, which is always interactive and controls the app.
 */
function TopBar() {
  const isInteractive = useInteractivity()

  const onToggle = () => window.electronAPI.toggleMouseEvents()
  const onIncreaseOpacity = () => window.electronAPI.increaseOpacity()
  const onDecreaseOpacity = () => window.electronAPI.decreaseOpacity()
  const onExit = () => window.electronAPI.exit()

  const toggleLabel = isInteractive
    ? 'Enable Click-Through (⌘⇧M)'
    : 'Disable Click-Through (⌘⇧M)'

  return (
    <div
      id="top-bar"
      className="topbar-neo gap-2 px-4 select-none"
      aria-label="Application Controls"
    >
      <TopBarButton
        id="toggle-btn"
        onClick={onToggle}
        aria-label="Toggle Click-Through (Cmd+Shift+M)"
      >
        {toggleLabel}
      </TopBarButton>

      <span
        id="state-indicator"
        className="ml-2 text-xs uppercase tracking-wider text-muted"
        aria-live="polite"
      >
        State: {isInteractive ? 'Interactive' : 'Click-Through'}
      </span>

      <div className="flex gap-2 ml-auto">
        <TopBarButton
          id="opacity-decrease-btn"
          onClick={onDecreaseOpacity}
          aria-label="Decrease Opacity (Cmd+[)"
        >
          Decrease Opacity (⌘[)
        </TopBarButton>
        <TopBarButton
          id="opacity-increase-btn"
          onClick={onIncreaseOpacity}
          aria-label="Increase Opacity (Cmd+])"
        >
          Increase Opacity (⌘])
        </TopBarButton>
        <TopBarButton
          id="exit-btn"
          onClick={onExit}
          aria-label="Exit Application (ESC)"
        >
          Exit (ESC)
        </TopBarButton>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('topbar-root')
if (!rootElement) {
  throw new Error('Fatal: Could not find topbar-root element.')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <TopBar />
  </React.StrictMode>
)
