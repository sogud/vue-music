# AGENTS.md

## Project

oto is an Electron + electron-vite + Vue 3.5 + TypeScript desktop music workstation.

Keep privileged work in `src/main` and expose only whitelisted APIs through `src/preload`. Renderer code must not access `fs`, `child_process`, `process.env`, SQLite, API keys, FluidSynth, or AI provider credentials directly.

Runtime must use real services and explicit empty/error states. Do not add mock songs, mock AI output, or fake render outputs.

## Frontend Stack

Use these libraries for renderer work:

- `shadcn-vue`: default component system for new renderer UI. Configuration lives in `components.json`; generated components live in `src/renderer/src/components/ui`.
- `reka-ui`: headless primitive layer used by shadcn-vue components. Prefer using generated shadcn-vue wrappers before importing Reka primitives directly.
- `@vueuse/core`: browser state, media queries, event listeners, storage helpers, timers, clipboard, element size, preferred color scheme, and reduced-motion detection.
- `motion-v`: component-level animation with `<motion.div />` when animation is part of the component structure.
- `@vueuse/motion`: directive animation with `v-motion`; the plugin is registered in `src/renderer/src/main.ts`.
- `lucide-vue-next`: icons for buttons, navigation, tool actions, and empty states.
- `clsx` + `tailwind-merge`: class composition through `cn()` from `src/renderer/src/lib/utils.ts`.

Prefer the local helper `useMotionPresets()` from `src/renderer/src/lib/motion.ts` for simple enter/scale transitions. It respects the user’s reduced-motion preference through VueUse.

When a new primitive is needed, add it with `npm exec shadcn-vue -- add <component> -y` instead of hand-writing a parallel component system. Keep oto-specific visual tone by mapping shadcn token classes through `tailwind.config.js` and `src/renderer/src/styles/main.css`.

## UI Direction

Keep the UI quiet and focused: light/dark support, warm neutral surfaces, restrained accent color, rounded cards, plenty of whitespace, and no chat-style main interface. Avoid dense DAW-style controls unless the user asks for them.

Use icons instead of text-only utility buttons where the action is familiar. Keep visible copy short; status and error text should be concrete, not explanatory.

## Commands

- `npm run dev:all`: start NeteaseCloudMusicApi and the Electron app.
- `npm run typecheck`: TypeScript and Vue type check.
- `npm test`: currently aliases typecheck.
- `npm run build`: production build through electron-vite.

Run `npm run typecheck` and `npm run build` after dependency, IPC, preload, or UI framework changes.
