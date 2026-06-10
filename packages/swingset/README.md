# Swingset

Component explorer for the Mosaic design system. Runs at http://localhost:6006.

## Dev

```
pnpm dev --filter @clerk/swingset
```

## Adding a component

**1. Create a story file** — `src/stories/my-component.stories.tsx`

```tsx
/** @jsxImportSource @emotion/react */
import type { StoryMeta } from '@/lib/types';
import { MyComponent, myComponentStyles } from '@clerk/ui/mosaic/components/my-component';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'My Component',
  styles: myComponentStyles, // CVA style object — knobs auto-generated from _variants
};

export function Default(props: Record<string, unknown>) {
  return <MyComponent {...(props as MyComponentProps)}>Content</MyComponent>;
}
```

Knobs are generated automatically from the CVA `_variants` on the style object. Boolean variants (`true`/`false` keys) become toggles; all others become selects. Default values come from `defaultVariants`.

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

<Story
  name='Default'
  storyModule={Stories}
/>

## Props

| Prop                 | Type                   | Default                |
| -------------------- | ---------------------- | ---------------------- |
| <code>variant</code> | <code>'primary'</code> | <code>'primary'</code> |
```

Register in `src/components/DocsViewer.tsx`:

```ts
const docModules = {
  'my-component': () => import('../stories/my-component.mdx'),
};
```

Also update the root redirect in `src/app/page.tsx` if this is now the first component.

## PropTable

In MDX, use `<PropTable>` to auto-generate the props table from the CVA style object:

```mdx
import * as Stories from './my-component.stories';

<PropTable meta={Stories.meta} />
```

Variant props (type and default) are derived from `meta.styles._variants` and `meta.styles._defaultVariants`. The `sx` prop is always appended automatically. Pass `extra` for any other non-variant props.

## Architecture

```
src/
  app/                 Next.js App Router
  components/
    app-sidebar.tsx    Left nav (reads from registry)
    ClientRoot.tsx     SidebarProvider + breadcrumb header
    DocsViewer.tsx     Renders MDX docs for /components/[slug]
    StoryCanvas.tsx    Renders a story + knobs for /components/[slug]/[story]
    KnobPanel.tsx      Auto-generated knob controls
    VariablesPanel.tsx Mosaic CSS variable overrides
    CodeBlock.tsx      Shiki syntax highlighter (css-variables theme)
  lib/
    registry.ts        Story registry — add new stories here
    generateKnobs.ts   CVA _variants → knob definitions
    types.ts           StoryMeta, StoryModule, KnobDef etc.
    slug.ts            URL slug utilities
  stories/             Story and MDX files
```
