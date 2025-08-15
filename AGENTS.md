# Repository Guidelines

## Project Structure & Module Organization

- `src/main/`: Electron main process (window creation, IPC, shortcuts).
- `src/preload/`: Secure bridge exposing `window.electronAPI`.
- `src/renderer/`: React UI (`components/`, `hooks/`, `styles/`, `index.html`).
- `src/shared/`: Shared `types.ts` and `constants.ts` (IPC channels, labels).
- `dist/`: Built output from electron-vite; `release/`: packaged app (via
  builder).
- Key config: `electron.vite.config.ts`, `package.json`, `bun.lock`,
  `deno.jsonc`.

## Build, Test, and Development Commands

- `bun install`: Install dependencies (use Bun).
- `bun run dev`: Start electron-vite; renderer served at
  `http://localhost:5173`.
- `bun run build`: Production build + package via electron-builder → `release/`.
- `bun run clean`: Remove `dist` and `.yek` artifacts.
- `bun run type:check`: TypeScript no-emit check.
- `bun run format`: Format code with Deno fmt.

## Coding Style & Naming Conventions

- Language: TypeScript + React (ESM). Indentation: match existing files (tabs).
- Components: PascalCase (`TopBar.tsx`, `TopBarButton.tsx`). Hooks: `useX.ts` in
  `hooks/`.
- Constants: UPPER_SNAKE_CASE; IPC channel strings are kebab-case.
- CSS: Tailwind v4 plus custom CSS modules in `styles/`.
- Keep all Node/Electron access in `preload/`; renderer is UI-only.

## Testing Guidelines

- Automated tests are not set up. Perform manual QA:
  - Launch with `bun run dev`; verify overlay covers primary display, top bar
    remains interactive.
  - Shortcuts: `Cmd+[`, `Cmd+]` adjust opacity; `Esc` exits.
  - Hover regions marked `data-interactive="true"` should remain clickable;
    other areas click-through when enabled.
- Consider adding Vitest for unit tests and Playwright for end-to-end.

## Commit & Pull Request Guidelines

- Commits: Prefer Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
  Keep scopes small.
- PRs: Include purpose, screenshots/GIF of UI, reproduction steps, platform
  tested (e.g., macOS), and linked issues.
- For IPC changes, update in lockstep: `src/shared/constants.ts` (channels),
  `src/shared/types.ts` (API), and `src/preload/index.ts` (bridge). Document new
  shortcuts in `README.md`.

## Security & Configuration Tips

- Keep `contextIsolation: true`; avoid direct Node access in the renderer.
- Expose only necessary methods on `window.electronAPI` and validate IPC usage.
