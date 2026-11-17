import type { ComponentDoc } from '../../docs-schema';
import type { RevealProps } from './reveal';

export default {
  name: 'Reveal',
  description:
    'Shows and hides its children by animating their height open and closed. The children mount when it opens and unmount once the close ends; while closing they are frozen and inert. No animation under reduced motion.',
  useFor: [
    'content that slides open below a control, such as extra fields',
    'an inline message or section that appears and disappears',
  ],
  keywords: ['reveal', 'expand', 'collapse', 'show', 'hide', 'height animation', 'disclosure'],
  practices: [
    { do: true, text: 'Keep `Reveal` mounted and toggle `open`, so the close can animate.' },
    {
      do: false,
      text: 'Use it for a section the user toggles with a button. Use `Collapsible` or `Accordion` instead, which wire the trigger.',
    },
  ],
  parts: {
    Reveal: {
      description:
        'A `div` that carries `data-open` or `data-closed` and the transition attributes. Takes no `render`.',
      slot: 'cl-reveal',
      props: { open: { type: 'boolean', doc: 'Whether the content shows.' } },
    },
  },
  examples: [
    {
      title: 'Extra fields',
      code: `
<Reveal open={showAdvanced}>
  <AdvancedFields />
</Reveal>
`,
    },
  ],
  related: ['Collapsible', 'Accordion'],
} satisfies ComponentDoc<{ Reveal: RevealProps }>;
