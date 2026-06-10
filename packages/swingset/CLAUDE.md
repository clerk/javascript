# CLAUDE.md

This file provides guidance to Coding Agents when working with code in this repository.

`@clerk/swingset` is a private (unpublished) component explorer — a Storybook-like app — for the **Mosaic** design system that lives in `@clerk/ui`. It is a Next.js App Router app that renders Mosaic components interactively with live knobs and design-token overrides.

## Commands

Run from the monorepo root or scope with `--filter @clerk/swingset`:

```
pnpm run dev:swingset.               # next dev on port 6006
pnpm build --filter @clerk/swingset  # next build
pnpm format --filter @clerk/swingset # format-package.mjs (--check for CI)
```

There are no tests or lint scripts in this package, yet.

## Key architecture facts

These require reading several files together; the `README.md` covers the step-by-step "add a component" workflow.

- **Consumes Mosaic from source, not build.** `@clerk/ui/mosaic` is aliased to `../ui/src/mosaic` in *two* places that must stay in sync: `next.config.mjs` (webpack `resolve.alias`) and `tsconfig.json` (`paths`). Editing Mosaic source in `packages/ui` reflects live in swingset's dev server — no rebuild of `@clerk/ui` needed.

- **Knobs are generated from CVA metadata, not hand-written.** A story's `meta.styles` is a Mosaic CVA style object exposing `_variants` / `_defaultVariants`. `lib/generateKnobs.ts` turns each variant into a control: variants whose keys are only `true`/`false` become boolean toggles, everything else becomes a select. Knob values are passed as props straight into the story component. This is why story functions take `Record<string, unknown>` and cast to the real prop type.

- **`lib/registry.ts` is the single source of truth for stories**, and stories are imported *explicitly* (never `import *`) so sidebar order is deterministic. `getSidebarGroups`, `findStory`, and slugging (`lib/slug.ts`, from `meta.title` and export name) all read from it. Adding a component touches up to three wiring points: `registry.ts` (knobs/canvas), `DocsViewer.tsx`'s `docModules` map (MDX docs), and the hardcoded redirect in `app/page.tsx`.

- **Routing.** `/components/[component]` renders MDX docs via `DocsViewer`; `/components/[component]/[story]` renders the interactive `StoryCanvas`. `app/page.tsx` is a static redirect (currently to `/components/button`) because `registry.ts` eagerly imports story modules (Emotion / `createContext`), so registry-derived data can't be computed in a Server Component.

- **Every story renders inside `MosaicProvider`.** `StoryCanvas` (interactive route) wraps the component in `MosaicProvider` and exposes a `VariablesPanel` that overrides `MosaicVariables` (color, rounded, spacing) live. `StoryEmbed` (used inside MDX via `<Story>`) renders with default knob values and no variable panel.

- **MDX.** `mdx-components.tsx` injects custom components into all MDX: `<Story>` (→ `StoryEmbed`), `<PropTable>` (derives a props table from `meta.styles._variants`/`_defaultVariants`, always appends `sx`), and a `<pre>` override routing fenced code through Shiki (`CodeBlock`). `next.config.mjs` configures `remark-gfm` and `rehype-raw` (with MDX node pass-through) so raw HTML in tables works.

- **Two component layers.** `src/components/ui/*` are shadcn/ui primitives (`components.json`, `base-nova` style, neutral base) used for swingset's *own* chrome (sidebar, tabs, inputs). The components being *documented* come from `@clerk/ui/mosaic`. Don't confuse the two. Mosaic stories use Emotion (`/** @jsxImportSource @emotion/react */` pragma; `compiler.emotion` enabled in Next).
