import type { ComponentDoc } from '../../docs-schema';
import type { SegmentedControlItemProps, SegmentedControlRootProps } from './segmented-control';

export default {
  name: 'SegmentedControl',
  description:
    "A row of mutually exclusive options with a sliding indicator under the selected one. A `role='radiogroup'` with one tab stop; the arrow keys move and select at once.",
  useFor: [
    'switching between a few views or modes, such as monthly and yearly billing',
    'a single choice among two to four short options',
  ],
  keywords: ['segmented control', 'toggle group', 'radio group', 'switcher', 'tabs', 'billing period'],
  practices: [
    { do: true, text: 'Give the root an accessible name with `aria-label` or `aria-labelledby`.' },
    { do: false, text: 'Use it to switch between panels of content. Use `Tabs` instead.' },
  ],
  parts: {
    'SegmentedControl.Root': {
      description:
        'Holds the selected value and renders a `div` with the indicator (`cl-segmented-control-indicator`). Carries `data-disabled`. Typed by the value, `string` by default.',
      slot: 'cl-segmented-control-root',
      props: {
        value: { type: 'Value', doc: 'The selected value, when controlled.' },
        defaultValue: { type: 'Value', doc: 'The selected value on mount, when uncontrolled.' },
        onValueChange: { type: '(value: Value) => void', doc: 'Called with the newly selected value.' },
        disabled: { type: 'boolean', doc: 'Disables every item.', default: 'false' },
      },
    },
    'SegmentedControl.Item': {
      description: "A `role='radio'` button. Carries `data-selected` and `data-disabled`.",
      slot: 'cl-segmented-control-item',
      props: {
        value: { type: 'unknown', doc: 'Identifies the item, compared with `Object.is`.' },
        disabled: { type: 'boolean', doc: 'Disables this item.', default: 'false' },
      },
    },
  },
  examples: [
    {
      title: 'Billing period',
      code: `
<SegmentedControl.Root aria-label='Billing period' value={period} onValueChange={setPeriod}>
  <SegmentedControl.Item value='month'>Monthly</SegmentedControl.Item>
  <SegmentedControl.Item value='annual'>Yearly</SegmentedControl.Item>
</SegmentedControl.Root>
`,
    },
  ],
  related: ['Tabs'],
} satisfies ComponentDoc<{
  'SegmentedControl.Root': SegmentedControlRootProps;
  'SegmentedControl.Item': SegmentedControlItemProps;
}>;
