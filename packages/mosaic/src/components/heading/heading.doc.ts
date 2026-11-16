import type { ComponentDoc } from '../../docs-schema';
import type { HeadingProps } from './heading';
import type { HeadingLevelProviderProps } from './heading-level';

export default {
  name: 'Heading',
  description:
    'A themeable heading with `size` and `color` from the typography scale. Renders an `h2` unless `level` says otherwise. `HeadingLevelProvider` sets the level for headings nested below it.',
  useFor: [
    'a section or page title',
    'a heading whose level follows its nesting, with `HeadingLevelProvider` and `useHeadingLevel`',
  ],
  keywords: ['heading', 'title', 'h1', 'h2', 'h3', 'level', 'outline'],
  practices: [
    {
      do: true,
      text: 'Pass `level={useHeadingLevel()}` when the heading should follow its nesting. `Heading` does not read the level from context on its own.',
    },
    { do: true, text: 'Wrap a nested region in `HeadingLevelProvider` so headings inside it sit one level deeper.' },
    { do: false, text: 'Pick `level` for its look. Use `size` for the look and `level` for the outline.' },
  ],
  parts: {
    Heading: {
      description: 'Renders `h1` to `h6` and forwards its ref. Defaults can come from `HeadingContext`.',
      slot: 'cl-heading',
      props: {
        size: { type: 'TypographySize', doc: 'Type scale step.', default: "'base'" },
        color: { type: 'TypographyColor', doc: 'Text color token.', default: "'foreground'" },
        level: { type: 'HeadingLevel', doc: 'The heading element, `1` to `6`.', default: '2' },
      },
    },
    HeadingLevelProvider: {
      description: 'Sets the level `useHeadingLevel` returns below it. Renders no element.',
      props: {
        level: {
          type: 'HeadingLevel',
          doc: 'The level for its subtree.',
          default: "one below the parent's, capped at `6`; the root is `2`",
        },
      },
    },
  },
  examples: [
    {
      title: 'A nested heading',
      code: `
<HeadingLevelProvider>
  <Heading level={useHeadingLevel()}>Members</Heading>
</HeadingLevelProvider>
`,
    },
  ],
  related: ['Panel', 'Text'],
} satisfies ComponentDoc<{ Heading: HeadingProps; HeadingLevelProvider: HeadingLevelProviderProps }>;
