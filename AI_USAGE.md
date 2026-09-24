# AI usage log

HighLevel asked for judgment, not typing speed. Architecture, permission rules, and what to cut were decided first. AI was used as a pair for boilerplate and unfamiliar APIs.

## Tools

- Cursor (Claude) for scaffolding, Tailwind v4 `@theme`, `@dnd-kit` column wiring, Vitest setup, and README structure.

## How the project was approached

1. Read the brief; listed MVP vs stretch.
2. Locked a normalized client store and “permissions in the store, not only the UI.”
3. Seeded Alice / Bob / Carol so the 30-second demo is obvious.
4. UI last: shell → tree → board/list/drawer → drag.

## Where AI helped

- Vite + `@tailwindcss/vite` plugin wiring.
- Zustand `persist` + `partialize` so toasts and loading are not saved.
- `@dnd-kit` multiple-column `SortableContext` / `DragOverlay` pattern.
- Vitest + Testing Library `setupFiles` and `jsdom`.
- Tailwind class names for skeleton, empty column, and toast.

## Where output was corrected or rejected

- Rejected Next.js, Redux, MUI/Ant Design, CSS modules, and cloning a Firebase “TaskFlow” repo.
- Rejected putting `if (!canSee) return null` only in React. Checks live in `permissions.ts` and every mutation.
- Rejected stretch goals (search, bulk, activity feed, subtasks) before MVP was complete.
- Inline `style=` limited to `@dnd-kit` transforms; 
- Avatar colors mapped to Tailwind tokens instead of dynamic `background` styles.
- Permission tests written against seed + a synthetic `deny` grant, rejected CSS related test cases.


