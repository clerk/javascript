import type { ComponentDoc } from '../../docs-schema';
import type { IconProps } from './icon';
import type { IconFrameProps } from './icon-frame';

export default {
  name: 'Icon',
  description:
    'Renders a Mosaic glyph, hidden from assistive tech. A glyph can be swapped by name through the `icons` prop on `MosaicProvider`, and the override gets the same sizing. `IconFrame` is a square box that frames an icon or image.',
  useFor: ['an icon in a button, row or label', 'a leading or trailing icon in a button', 'a framed icon tile'],
  keywords: ['icon', 'glyph', 'svg', 'icon frame', 'tile'],
  practices: [
    {
      do: true,
      text: 'Set `placement` when the icon leads or trails a `Button` label, so the button tightens that side.',
    },
    { do: true, text: "Use `size='inherit'` for an icon in running text or a heading." },
    {
      do: false,
      text: 'Rely on the icon for the accessible name. It renders `aria-hidden`; name the control with text or `aria-label`.',
    },
    {
      do: false,
      text: 'Expect `ref` to reach an icon swapped through `MosaicProvider`. It only reaches the built-in glyph.',
    },
  ],
  parts: {
    Icon: {
      description:
        'Renders the `glyph` as an `svg`, or its override. Takes its color from `currentColor` unless the container sets one.',
      slot: 'cl-icon',
      props: {
        glyph: { type: 'IconComponent', doc: 'The glyph component, from `src/icons/glyphs`.' },
        size: {
          type: "'sm' | 'md' | 'lg' | 'inherit'",
          doc: '`sm`, `md`, `lg`, or `inherit` to follow the font size.',
          default: "'md'",
        },
        placement: {
          type: "'inline-start' | 'inline-end'",
          doc: 'Marks the icon as leading or trailing content, as `data-icon`. Applies no style of its own.',
        },
      },
    },
    IconFrame: {
      description: 'A square `span` that centers its content, sized to the media scale.',
      slot: 'cl-icon-frame',
      props: {
        bordered: { type: 'boolean', doc: 'Draws a subtle border.', default: 'true' },
        filled: { type: 'boolean', doc: 'Fills the box with a neutral tint.', default: 'false' },
        size: { type: "'xs' | 'sm' | 'md' | 'lg'", doc: '`xs`, `sm`, `md` or `lg`.', default: "'md'" },
      },
    },
  },
  examples: [
    {
      title: 'A trailing icon in a button',
      code: `
<Button>
  Next
  <Icon glyph={ChevronRight} placement='inline-end' />
</Button>
`,
    },
  ],
  related: ['Button', 'MosaicProvider'],
} satisfies ComponentDoc<{ Icon: IconProps; IconFrame: IconFrameProps }>;
