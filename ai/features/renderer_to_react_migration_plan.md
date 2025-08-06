# React Migration Plan for src/renderer/index.html

This document outlines a complete, step-by-step plan to convert the current
HTML-based renderer (src/renderer/index.html + src/renderer/app.ts) into a
React-based renderer while preserving the existing Electron + Vite setup and
preload IPC surface.

Scope:

- Electron + Vite project, with renderer assets in src/renderer.
- Target: Introduce React + TypeScript (TSX), migrate bootstrap to React root,
  keep styles, and maintain preload typings.

Assumptions:

- Using Vite (electron.vite.config.ts present).
- TypeScript already configured (tsconfig comes from electron-vite).
- Preload sandbox and typing surface should remain intact.

---

## 1) Goals and Constraints

Goals

- Replace direct DOM/bootstrap code with a React entry and component tree.
- Keep existing styles (CSS files) and tokens working without changes.
- Maintain preload-safe IPC access with type safety.
- Enable HMR for React development via Vite.

Constraints

- No changes to Electron main/preload security model (e.g., nodeIntegration:
  false).
- Keep renderer isolated; only migrate UI bootstrap and downstream logic.
- Avoid breaking production packaging.

---

## 2) Directory and Build Setup Changes

Current tree (relevant):

- src/renderer/index.html
- src/renderer/app.ts
- src/renderer/styles/\*.css

Target tree (additions):

- src/renderer/main.tsx // React entry point
- src/renderer/App.tsx // Top-level App component
- src/renderer/index.html // Keep, but convert to React root mount
- src/renderer/types/env.d.ts // Optional: augment window if needed (or reuse
  global.d.ts)
- src/renderer/styles/\*.css // Keep; import in main.tsx or App.tsx
- package.json dependencies: react, react-dom, @types/react, @types/react-dom

Vite will automatically handle TSX with React; no special plugin required.

---

## 3) Dependencies to Add

Add dependencies:

- react
- react-dom
- @types/react
- @types/react-dom

Script (informational):

- bun add react react-dom @types/react @types/react-dom

Note: Dev vs prod types can be -D. React packages are prod deps.

---

## 4) Renderer Bootstrap Conversion (React Entry)

Create src/renderer/main.tsx:

- Mount a React root on a div#root provided by index.html.
- Import a single global CSS entry (index.css). This file will @import or
  include Tailwind layers and any token files so the rest auto-loads.
- Optionally set up StrictMode.

Actual example from this repo (paths are real):

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Only one global CSS entry for the renderer. It aggregates tokens and any Tailwind layers.
import './styles/index.css'

const container = document.getElementById('root')
if (!container) {
	throw new Error('Root container #root not found in index.html')
}
const root = createRoot(container)
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
```

---

## 5) Converting index.html to React Root

Update src/renderer/index.html:

- Provide a single #root mount element.
- Ensure correct script entry points via Vite (main.tsx).
- Keep preload script linkage configured via electron.vite.config.ts (handled by
  builder; no direct changes in HTML for preload).
- Keep meta tags, fonts, and any static links as-is.

Actual example adapted to this repo (file: src/renderer/index.html):

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta
			http-equiv="Content-Security-Policy"
			content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
		/>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Transparent Window</title>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/src/renderer/main.tsx"></script>
	</body>
</html>
```

Notes:

- If there are existing static DOM nodes/content in index.html, migrate them
  into React components (App.tsx). The HTML should be minimal.

---

## 6) App Component Composition

Create src/renderer/App.tsx:

- Port content and behavior from src/renderer/app.ts (imperative) into React
  components.
- Use functional components and hooks (useEffect/useState).
- Access window.\* APIs typed via global.d.ts.

Concrete example (uses existing CSS classes from src/renderer/styles and an
example IPC invoke/send):

```tsx
import React from 'react'

export default function App() {
	const [version, setVersion] = React.useState<string>('')

	React.useEffect(() => {
		;(async () => {
			try {
				// Example: resolve app version via preload-exposed IPC
				const v = await window.api?.invoke<string>('app:getVersion')
				if (v) setVersion(v)
			} catch {}
		})()
	}, [])

	return (
		<main className='layout page'>
			<section className='section'>
				<h1 className='title'>Transparent Window</h1>
				<p className='subtitle'>Electron + React</p>
				<p>
					<code className='code'>App Version</code>: {version || 'Loading...'}
				</p>

				<div className='buttons'>
					<button
						className='btn primary'
						onClick={() => window.api?.send('toggle-transparency')}
					>
						Toggle Transparency
					</button>
				</div>
			</section>
		</main>
	)
}
```

---

## 7) TypeScript/Types Setup (window and Preload)

This repo already includes src/renderer/global.d.ts. Use it to type window.api
to match src/preload/index.ts and src/shared/types.ts.

Actual shape to include/verify in src/renderer/global.d.ts:

```ts
declare global {
	interface Window {
		api?: {
			send: (channel: string, payload?: unknown) => void
			invoke: <T = unknown>(channel: string, payload?: unknown) => Promise<T>
			on: (channel: string, listener: (...args: any[]) => void) => void
			off: (channel: string, listener: (...args: any[]) => void) => void
		}
	}
}
export {}
```

Align the method names and channel names with what you expose in
src/preload/index.ts and reuse shared types from src/shared/types.ts where
applicable.

If these declarations already exist in src/renderer/global.d.ts, reuse that
file; no further changes required besides ensuring the API shape matches
preload.

---

## 8) IPC and Preload Integration in React

Patterns:

- For one-off invokes: call window.api?.invoke inside event handlers or effects.
- For event streams: subscribe in useEffect; cleanup on unmount.

Example:

```tsx
React.useEffect(() => {
	if (!window.api) return

	const handler = (payload: any) => {
		// set state, etc.
	}
	window.api.on('some-event', handler)
	return () => window.api?.off('some-event', handler)
}, [])
```

Ensure channels and payload typings reflect src/shared/types.ts if present;
import shared types into React code where applicable.

---

## 9) Styles, Tokens, Tailwind, and Assets

Global CSS entry (this repo’s real files):

- Import ONLY ./styles/index.css in main.tsx. Do not import other CSS files
  directly from the renderer entry.
- index.css aggregates tokens.css and any global layers.

If using Tailwind v4 (official v4 guidance for Vite):

Install v4 core + Vite plugin using Bun:

- bun add -d tailwindcss @tailwindcss/vite

Configure Vite with the official Tailwind v4 plugin (source: Tailwind v4 docs):

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [tailwindcss()],
})
```

Import Tailwind in your single global CSS entry (v4 uses @import, not
@tailwind):

```css
/* src/renderer/styles/index.css */

/* Tailwind v4 — import the framework */
@import 'tailwindcss';

/* Design tokens (CSS custom properties) */
@import './tokens.css';

/* Existing global styles in this repo */
@import './base.css';
@import './typography.css';
@import './layout.css';
@import './sections.css';
@import './buttons.css';
@import './code.css';
```

Notes (v4 specifics):

- No tailwind.config.js is required for basic usage; v4 favors CSS-first
  configuration.
- If you need PostCSS integration instead of the Vite plugin, use
  @tailwindcss/postcss in postcss.config and keep the same @import
  "tailwindcss"; in index.css.
- Prettier class sorting remains optional (prettier-plugin-tailwindcss).

Notes:

- Keep tokens (src/renderer/styles/tokens.css) as the single source of CSS
  variables and import from index.css.
- You do not import any of the above from main.tsx other than index.css.

Assets:

- Images/fonts referenced via Vite path handling continue to work. If currently
  linked in index.html, consider moving to CSS imports or static imports in
  components as needed.

---

## 10) Remove or Refactor src/renderer/app.ts

- If app.ts only bootstraps DOM or adds event listeners, migrate logic to React
  and then remove app.ts.
- If app.ts exposes utilities, split them into modules (e.g.,
  src/renderer/lib/\*.ts) and import into components.
- Run a repo-wide search for imports of src/renderer/app.ts before removing to
  avoid breaks.

---

## 11) Hot Reload and Dev Workflow

- Vite provides HMR for React by default.
- Start dev as usual with Bun (e.g., bun dev per your scripts).
- Ensure electron.vite.config.ts points to src/renderer/index.html and that
  preload is properly wired; typically handled by electron-vite scaffolding.

---

## 12) Testing Approach

- Component tests: Vitest + @testing-library/react (optional).
- IPC boundaries can be mocked by stubbing window.api in tests.
- Snapshot simple components, and integration-test IPC-driven UI flows.

---

## 13) Incremental Migration Strategy

If index.html currently has complex structure and multiple scripts:

1. Phase 1: Introduce React root alongside existing DOM. Render a small
   component in a region of the page to validate wiring.
2. Phase 2: Gradually replace sections with React components. Keep styles
   stable.
3. Phase 3: Remove old imperative code and consolidate logic into
   components/hooks.
4. Phase 4: Clean up unused files, dead CSS, and HTML remnants.

Given the current project appears simple, you can likely skip to full migration
directly.

---

## 14) Rollback Plan

- Keep a branch with the pre-React renderer.
- Migration is mostly additive (new files + adjusted index.html). You can revert
  index.html and delete React files to roll back quickly.
- Avoid changing preload/main during migration to keep rollback minimal.

---

## 15) Concrete Action Checklist

1. Install React deps:

   - bun add react react-dom @types/react @types/react-dom

2. Create src/renderer/main.tsx (React root) and import global CSS.

3. Create src/renderer/App.tsx. Move UI from app.ts into React.

4. Update src/renderer/index.html to have <div id="root"> and script
   src="/src/renderer/main.tsx".

5. Verify window API typings in src/renderer/global.d.ts match preload surface.
   Adjust if needed.

6. Replace any direct DOM manipulation with React state/effects. Use window.api
   for IPC.

7. Remove src/renderer/app.ts if fully migrated; otherwise, refactor and keep
   only reusable helpers.

8. Run dev and validate:

   - bun dev
   - Verify hot reload and IPC events render correctly in UI.

9. Optional: add tests for critical components.

---

## 16) Example Minimal Files (grounded in this repo)

App.tsx (uses existing class names and IPC patterns relevant to this project)

```tsx
import React from 'react'

export default function App() {
	const [version, setVersion] = React.useState<string>('')

	React.useEffect(() => {
		;(async () => {
			try {
				const v = await window.api?.invoke<string>('app:getVersion')
				if (v) setVersion(v)
			} catch {}
		})()
	}, [])

	return (
		<main className='layout page'>
			<section className='section'>
				<h1 className='title'>Transparent Window</h1>
				<p className='subtitle'>Electron + React</p>
				<p>
					<code className='code'>App Version</code>: {version || 'Loading...'}
				</p>

				<div className='buttons'>
					<button
						className='btn primary'
						onClick={() => window.api?.send('toggle-transparency')}
					>
						Toggle Transparency
					</button>
				</div>
			</section>
		</main>
	)
}
```

main.tsx

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Single global CSS entry that aggregates tokens and (optionally) Tailwind layers
import './styles/index.css'

const el = document.getElementById('root')!
createRoot(el).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
```

index.html (renderer) — see section "5) Converting index.html to React Root" for
the complete example used in this repo.

---

## 17) Post-Migration Cleanup

- Remove dead code and styles that were only relevant to the old DOM.
- Ensure eslint/tsconfig includes "jsx": "react-jsx" if needed (Vite templates
  set this automatically).
- Confirm production build works (electron-builder/electron-vite build
  pipeline).

---

Deliverable: This plan provides all changes needed to convert index.html to a
React-based renderer, including file additions, code templates, dependency
changes, IPC integration patterns, and an incremental rollout option.
