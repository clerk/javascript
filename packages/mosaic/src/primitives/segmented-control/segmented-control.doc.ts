import type { ComponentDoc } from '../../docs-schema';
import type { SegmentedControlIndicatorProps } from './segmented-control-indicator';
import type { SegmentedControlItemProps } from './segmented-control-item';
import type { SegmentedControlRootProps } from './segmented-control-root';

export default {
  name: 'SegmentedControl',
  description:
    'Headless, unstyled single-select row of buttons, one always active. Follows the radio group pattern: `role="radiogroup"`, `role="radio"` items, one tab stop, and arrow keys that move the selection.',
  useFor: [
    'switching between a few mutually exclusive options',
    'a billing period toggle, such as monthly or annual',
    'a compact single choice shown as buttons instead of radios',
  ],
  keywords: ['segmented control', 'toggle group', 'radio group', 'switcher', 'button group', 'single select'],
  practices: [
    { do: true, text: 'Name the group with `aria-label` or `aria-labelledby` on `SegmentedControl.Root`.' },
    {
      do: true,
      text: 'Slide `SegmentedControl.Indicator` with its `data-direction`, which says whether the selection moved forward or backward.',
    },
    { do: false, text: 'Use it when each option owns a panel of content. Use `Tabs` instead.' },
  ],
  parts: {
    'SegmentedControl.Root': {
      description:
        'A `div` with `role="radiogroup"` that holds the selection and arrow-key navigation. Carries `data-disabled`.',
      props: {
        value: { type: 'Value', doc: 'The selected value, when controlled.' },
        defaultValue: { type: 'Value', doc: 'The selected value on mount, when uncontrolled.' },
        onValueChange: {
          type: '(value: Value) => void',
          doc: 'Called with the new value. Not called when the same item is chosen again.',
        },
        disabled: { type: 'boolean', doc: 'Disables every item.', default: 'false' },
      },
    },
    'SegmentedControl.Item': {
      description:
        'A `button` with `role="radio"` and `aria-checked`. Carries `data-selected` and `data-disabled`. Arrow keys select as they move.',
      props: {
        value: { type: 'unknown', doc: 'Identifies the option, compared with `Object.is`. Unique within the root.' },
        disabled: { type: 'boolean', doc: 'Sets `aria-disabled`. The item stays focusable.' },
      },
    },
    'SegmentedControl.Indicator': {
      description: 'A decorative `span`, `aria-hidden`, for the selection highlight. Carries `data-direction`.',
    },
  },
  examples: [
    {
      title: 'Billing period',
      code: `
<SegmentedControl.Root aria-label='Billing period' defaultValue='monthly'>
  <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
  <SegmentedControl.Item value='annual'>Annual</SegmentedControl.Item>
</SegmentedControl.Root>
`,
    },
  ],
  related: ['Tabs'],
} satisfies ComponentDoc<{
  'SegmentedControl.Root': SegmentedControlRootProps;
  'SegmentedControl.Item': SegmentedControlItemProps;
  'SegmentedControl.Indicator': SegmentedControlIndicatorProps;
}>;
