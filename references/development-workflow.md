# Development Workflow

## Setup

```sh
corepack enable && pnpm install && pnpm build
```

`pnpm build` is required before dev — it generates types and resolves workspace deps.

## Dev Commands

| Command            | What it does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `pnpm dev`         | Watch all packages (excludes expo, tanstack, chrome-extension) |
| `pnpm dev:fe-libs` | Watch `clerk-js`, `ui`, `shared` only                          |
| `pnpm dev:js`      | Build deps then watch `clerk-js`                               |
| `pnpm dev:sandbox` | Sandbox UI at `localhost:4000` + UI at `localhost:4011`        |

Most packages use `tsup --watch` or `tsdown --watch`. `clerk-js` and `ui` use rspack dev server with HMR.

## Sandbox

`packages/clerk-js/sandbox/` — browser environment for iterating on UI components without a real app.

Runtime controls via browser console:

```js
components.signIn.setProps({
  /* ... */
}); // Adjust props
scenario.setScenario(scenario.UserButtonLoggedIn); // Switch MSW mock
```

Scenarios live in `packages/clerk-js/sandbox/scenarios/`.

## Non-Obvious Gotchas

- `pnpm install` must run from the monorepo root, never from a package directory.
- If TypeScript errors come from `@clerk/shared/types`, rebuild: `turbo build --filter=@clerk/shared --filter=@clerk/types`
- To reset a broken state: `pnpm nuke && pnpm install && pnpm build`
- Commit scope is required and must be a package name (e.g. `fix(clerk-js):`) or `repo`/`release`/`e2e`/`ci`/`*`
- PR changesets: `pnpm changeset` for user-facing changes, `pnpm changeset:empty` for internal-only
