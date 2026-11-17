import type { ComponentDoc } from '../../docs-schema';
import type { TextProps } from './text';

export default {
  name: 'Text',
  description:
    'Themeable body copy with `size` and `color` variants. Renders a `p`, or the `render` element. Defaults can come from `TextContext`.',
  useFor: ['body copy or a paragraph', 'secondary or muted text', 'inline copy inside other text, with `render`'],
  keywords: ['text', 'paragraph', 'body copy', 'typography', 'muted', 'caption'],
  practices: [
    { do: true, text: 'Pass `render={<span />}` for inline copy.' },
    { do: true, text: "Use `color='foreground-secondary'` for muted copy instead of an `xstyle` color." },
  ],
  parts: {
    Text: {
      description: 'Renders a `p` and forwards its ref. Carries `data-size` and `data-color`.',
      slot: 'cl-text',
      props: {
        size: { type: 'TypographySize', doc: '`xs`, `sm`, `base`, `lg`, `xl` or `2xl`.', default: "'sm'" },
        color: {
          type: 'TypographyColor',
          doc: '`foreground`, `foreground-secondary`, `brand`, `warning`, `negative` or `positive`.',
          default: "'foreground'",
        },
      },
    },
  },
  examples: [
    {
      title: 'Body copy',
      code: `
<Text>{description}</Text>
`,
    },
    {
      title: 'Inline muted copy',
      code: `
<Text render={<span />} color='foreground-secondary'>{email}</Text>
`,
    },
  ],
} satisfies ComponentDoc<{ Text: TextProps }>;
