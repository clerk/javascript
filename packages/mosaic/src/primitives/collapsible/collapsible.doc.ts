import type { ComponentDoc } from '../../docs-schema';
import type { CollapsiblePanelProps, CollapsibleProps, CollapsibleTriggerProps } from './parts';

export default {
  name: 'Collapsible',
  description:
    'Headless, unstyled single panel shown and hidden by a button. Wires `aria-expanded`, `aria-controls` and `role="region"`, and measures the panel so CSS can animate its size.',
  useFor: ['one section that shows and hides its content', 'a show more toggle or an advanced options panel'],
  keywords: ['collapsible', 'disclosure', 'expand', 'show more', 'toggle', 'details'],
  practices: [
    {
      do: true,
      text: 'Animate the panel size with `--collapsible-panel-height` and `--collapsible-panel-width`, set from the measured panel while it opens or closes.',
    },
    { do: false, text: 'Pass `id` to the trigger or panel. The primitive owns both to pair them.' },
    { do: false, text: 'Hide content by hand with `display: none`. The panel unmounts once closed.' },
    { do: false, text: 'Stack several for a set of sections. Use `Accordion` instead.' },
  ],
  parts: {
    'Collapsible.Root': {
      description:
        'Holds the open state. Renders a `div`, or the `render` element, with `data-open` or `data-closed`, and `data-disabled`.',
      props: {
        open: { type: 'boolean', doc: 'Whether the panel is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the panel is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        disabled: { type: 'boolean', doc: 'Stops the trigger from toggling.', default: 'false' },
      },
    },
    'Collapsible.Trigger': {
      description:
        'A `button` that toggles the panel. Carries `aria-expanded`, `aria-controls`, `aria-disabled`, and the same data attributes as the root.',
    },
    'Collapsible.Panel': {
      description:
        'The content, as `role="region"` labelled by the trigger. Carries `data-open` or `data-closed`. Unmounts once closed and its exit transition ends, and skips the enter transition on first mount.',
    },
  },
  examples: [
    {
      title: 'A toggle',
      code: `
<Collapsible.Root>
  <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
  <Collapsible.Panel>…</Collapsible.Panel>
</Collapsible.Root>
`,
    },
  ],
  related: ['Accordion', 'usePanelSize'],
} satisfies ComponentDoc<{
  'Collapsible.Root': CollapsibleProps;
  'Collapsible.Trigger': CollapsibleTriggerProps;
  'Collapsible.Panel': CollapsiblePanelProps;
}>;
