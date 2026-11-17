import type { ComponentDoc } from '../../docs-schema';
import type {
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionProps,
  AccordionTriggerProps,
} from './parts';

export default {
  name: 'Accordion',
  description:
    'Headless, unstyled stack of collapsible sections, with one or many open at once. Wires `aria-expanded`, `aria-controls` and `role="region"`, and moves focus between triggers with the arrow keys.',
  useFor: ['a set of sections that each show and hide their content', 'a FAQ or a settings list with expandable rows'],
  keywords: ['accordion', 'collapsible', 'expand', 'disclosure', 'sections', 'faq'],
  practices: [
    { do: true, text: 'Put each `Accordion.Trigger` inside an `Accordion.Header`, so the trigger sits in a heading.' },
    {
      do: true,
      text: 'Animate the panel height with `--cl-accordion-panel-height`, set from the measured panel.',
    },
    { do: false, text: 'Pass `id` to a trigger or panel. The primitive owns both to pair them.' },
    { do: false, text: 'Use it for a single show-and-hide section. Use `Collapsible` instead.' },
  ],
  parts: {
    'Accordion.Root': {
      description:
        'Holds which items are open and the arrow-key navigation across triggers. Renders a `div`, or the `render` element.',
      props: {
        value: { type: 'string[]', doc: 'The open item values, when controlled.' },
        defaultValue: { type: 'string[]', doc: 'The open item values on mount, when uncontrolled.', default: '[]' },
        onValueChange: { type: '(value: string[]) => void', doc: 'Called with the new open item values.' },
        type: { type: "'single' | 'multiple'", doc: '`single` keeps at most one item open.', default: "'multiple'" },
        disabled: { type: 'boolean', doc: 'Disables every item.', default: 'false' },
      },
    },
    'Accordion.Item': {
      description: 'One section. Carries `data-open` or `data-closed`, and `data-disabled`.',
      props: {
        value: { type: 'string', doc: 'Identifies the item in `value`. Unique within the root.' },
        disabled: { type: 'boolean', doc: 'Disables this item.', default: "the root's `disabled`" },
      },
    },
    'Accordion.Header': { description: 'Renders an `h3` around the trigger.' },
    'Accordion.Trigger': {
      description:
        'A `button` that toggles its item. Carries `aria-expanded` and `aria-controls`, and the same data attributes as the item.',
    },
    'Accordion.Panel': {
      description:
        'The content, as `role="region"` labelled by its trigger. Unmounts once closed and its exit transition ends.',
    },
  },
  examples: [
    {
      title: 'One open at a time',
      code: `
<Accordion.Root type='single' defaultValue={['billing']}>
  <Accordion.Item value='billing'>
    <Accordion.Header>
      <Accordion.Trigger>Billing</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>…</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
`,
    },
  ],
  related: ['Collapsible'],
} satisfies ComponentDoc<{
  'Accordion.Root': AccordionProps;
  'Accordion.Item': AccordionItemProps;
  'Accordion.Header': AccordionHeaderProps;
  'Accordion.Trigger': AccordionTriggerProps;
  'Accordion.Panel': AccordionPanelProps;
}>;
