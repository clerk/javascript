# Swingset

Component explorer for the Mosaic design system. Runs at http://localhost:6006.

## Dev

```
pnpm dev --filter @clerk/swingset
```

## Adding a component

**1. Create a story file** — `src/stories/my-component.stories.tsx`

```tsx
import type { StoryMeta } from '@/lib/types';
import { MyComponent, type MyComponentProps } from '@clerk/ui/mosaic/components/my-component';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'My Component',
  source: 'packages/ui/src/mosaic/components/my-component/my-component.tsx', // repo-root path → "View source" link
  // Variant surface, declared by hand — knobs are generated from `_variants`
  styles: {
    _variants: { variant: { primary: {}, outline: {} }, size: { sm: {}, md: {} } },
    _defaultVariants: { variant: 'primary', size: 'md' },
  },
};

export function Default(props: Record<string, unknown>) {
  return <MyComponent {...(props as MyComponentProps)}>Content</MyComponent>;
}
```

Knobs are generated automatically from the hand-written `_variants` on `meta.styles`. Boolean variants (`true`/`false` keys) become toggles; all others become selects. Default values come from `_defaultVariants`.

`source` is the path to the component's exporting file relative to the monorepo root; `DocsViewer` renders it as a "View source" link to the file on GitHub (`lib/source.ts`).

**2. Register in `src/lib/registry.ts`**

```ts
import { meta as myMeta, Default } from '../stories/my-component.stories';

const myModule: StoryModule = { meta: myMeta, Default };
export const registry: StoryModule[] = [..., myModule];
```

Import stories explicitly (not `import *`) to control sidebar order.

**3. Add docs** — `src/stories/my-component.mdx`

```mdx
import * as Stories from './my-component.stories';

# My Component

## Playground

<Preview
  name='Default'
  storyModule={Stories}
/>

## Props

<PropTable meta={Stories.meta} />
```

`<Preview>` renders the live component inline in the overview — there are no separate
per-story pages. Its props are edited through the controls in the `<PropTable>` below it;
the two share the page's playground state. Use `<Story name='Sizes' …>` for additional
static demos of specific variations (no controls).

Register in `src/components/DocsViewer.tsx`:

```ts
const docModules = {
  'my-component': () => import('../stories/my-component.mdx'),
};
```

Also update the root redirect in `src/app/page.tsx` if this is now the first component.

## PropTable

In MDX, use `<PropTable>` to auto-generate the props table from the story's declared variant surface:

```mdx
import * as Stories from './my-component.stories';

<PropTable meta={Stories.meta} />
```

Variant props (type and default) are derived from `meta.styles._variants` and `meta.styles._defaultVariants`. The `className` and `style` escape-hatch rows are always appended automatically. Pass `extra` for any other non-variant props.

## Architecture

```
src/
  app/                 Next.js App Router
  components/
    app-sidebar.tsx    Left nav (reads from registry)
    ClientRoot.tsx     SidebarProvider + breadcrumb header
    DocsViewer.tsx       Renders MDX docs for /components/[slug]; provides PlaygroundContext
    PlaygroundContext.tsx Shared per-page knob values
    StoryPreview.tsx     Live <Preview> embed, props driven by the playground state
    StoryEmbed.tsx       Static <Story> embed: a single variation, no controls
    PropTable.tsx        Interactive props table — controls live in the Value column
    KnobControl.tsx      A single auto-generated control (switch/select/input)
    CodeBlock.tsx        Shiki syntax highlighter (css-variables theme)
    ViewSource.tsx       "View source" link to the component's file on GitHub
  lib/
    registry.ts        Story registry — add new stories here
    generateKnobs.ts   meta.styles._variants → knob definitions
    types.ts           StoryMeta, StoryModule, KnobDef etc.
    slug.ts            URL slug utilities
    source.ts          Builds GitHub URLs from meta.source paths
  stories/             Story and MDX files
```
