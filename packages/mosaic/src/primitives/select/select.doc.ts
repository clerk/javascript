import type { ComponentDoc } from '../../docs-schema';
import type { SelectArrowProps } from './select-arrow';
import type { SelectGroupLabelProps, SelectGroupProps } from './select-group';
import type { SelectOptionProps } from './select-option';
import type { SelectPopupProps } from './select-popup';
import type { SelectPortalProps } from './select-portal';
import type { SelectPositionerProps } from './select-positioner';
import type { SelectProps } from './select-root';
import type { SelectTriggerProps } from './select-trigger';
import type { SelectValueProps } from './select-value';

export default {
  name: 'Select',
  description:
    'Headless, unstyled replacement for a native `<select>`: pick one value, or several with `multiple`, from a fixed list. Has typeahead and arrow-key navigation, and by default lays the selected option over the trigger.',
  useFor: [
    'picking one value from a fixed list of options',
    'picking several values from a fixed list',
    'a styled dropdown in place of a native select',
  ],
  keywords: ['select', 'dropdown', 'listbox', 'picker', 'options', 'multi-select', 'choose'],
  practices: [
    {
      do: true,
      text: 'Pass `label` on each `Select.Option` whose value is not display text. It falls back to `String(value)`.',
    },
    {
      do: true,
      text: 'Pass `items` when `Select.Value` must show a label before the options mount, such as on first render.',
    },
    { do: true, text: 'Put a `Select.GroupLabel` inside every `Select.Group`. It throws outside one.' },
    {
      do: false,
      text: 'Pass `id` to `Select.Positioner`. The primitive owns it to pair the trigger’s `aria-controls`.',
    },
    { do: false, text: 'Expect `items` to render options. It only resolves labels; render each `Select.Option`.' },
    { do: false, text: 'Use it when the user types to filter. Use `Combobox` instead.' },
  ],
  parts: {
    'Select.Root': {
      description: 'Holds the selection, open state and list navigation. Renders no element.',
      props: {
        multiple: {
          type: 'boolean',
          doc: 'Makes the value an array. Picking toggles an option and keeps the popup open.',
          default: 'false',
        },
        value: {
          type: 'Value | Value[] | null',
          doc: 'The selection, when controlled. `null` for none, or an array with `multiple`.',
        },
        defaultValue: { type: 'Value | Value[] | null', doc: 'The selection on mount, when uncontrolled.' },
        onValueChange: {
          type: '((value: Value) => void) | ((value: Value[]) => void)',
          doc: 'Called with the new value, or the new array with `multiple`.',
        },
        open: { type: 'boolean', doc: 'Whether the popup is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the popup is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        items: {
          type: 'SelectItem<Value>[]',
          doc: '`{ label, value }` pairs that resolve labels before options mount.',
        },
        alignItemWithTrigger: {
          type: 'boolean',
          doc: 'Lays the selected option over the trigger. Falls back to a dropdown on touch, with nothing selected, or near a viewport edge.',
          default: 'true',
        },
        placement: {
          type: 'Placement',
          doc: 'Where the popup sits when it is not aligned over the trigger.',
          default: "'bottom-start'",
        },
        sideOffset: { type: 'number', doc: 'Gap to the trigger in px.', default: '4' },
      },
    },
    'Select.Trigger': { description: 'A `button` that toggles the popup. Carries `data-open` or `data-closed`.' },
    'Select.Value': {
      description: 'A `span` showing the selected labels, joined with commas.',
      props: {
        placeholder: { type: 'ReactNode', doc: 'Shown while nothing is selected.' },
        children: {
          type: 'ReactNode | ((value: unknown[]) => ReactNode)',
          doc: 'Replaces the labels. A function gets the selected values in the order picked, and yields to `placeholder` while empty.',
        },
      },
    },
    'Select.Portal': {
      description: 'Portals its children while the popup is mounted.',
      props: {
        root: {
          type: 'HTMLElement | null | React.RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `Portal` container',
        },
      },
    },
    'Select.Positioner': {
      description:
        'The floating `div` with `role="listbox"`, and `aria-multiselectable` with `multiple`. Carries `data-side`, which is `none` while aligned over the trigger. Page scroll locks while aligned.',
    },
    'Select.Popup': {
      description:
        'Wraps the options. Carries `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`. Its children freeze while it closes.',
    },
    'Select.Option': {
      description:
        'A `button` with `role="option"` and `aria-selected`. Carries `data-selected`, `data-active` and `data-disabled`.',
      props: {
        value: { type: 'unknown', doc: 'The option value, compared with `Object.is`.' },
        label: { type: 'string', doc: 'Shown in `Select.Value` and matched by typeahead.', default: 'String(value)' },
        disabled: { type: 'boolean', doc: 'Sets `aria-disabled` and blocks selection. The option stays focusable.' },
      },
    },
    'Select.Group': { description: 'A `div` with `role="group"`, labelled by its `Select.GroupLabel`.' },
    'Select.GroupLabel': { description: 'Names the `Select.Group` it sits in.' },
    'Select.Arrow': {
      description: 'An optional `FloatingArrow` `svg` pointing at the trigger. Carries `data-side`.',
    },
  },
  examples: [
    {
      title: 'Single select',
      code: `
<Select.Root>
  <Select.Trigger>
    <Select.Value placeholder='Choose a fruit' />
  </Select.Trigger>
  <Select.Positioner>
    <Select.Popup>
      <Select.Option value='apple' label='Apple' />
      <Select.Option value='banana' label='Banana' />
    </Select.Popup>
  </Select.Positioner>
</Select.Root>
`,
    },
  ],
  related: ['Combobox', 'Menu', 'Portal'],
} satisfies ComponentDoc<{
  'Select.Root': SelectProps;
  'Select.Trigger': SelectTriggerProps;
  'Select.Value': SelectValueProps;
  'Select.Portal': SelectPortalProps;
  'Select.Positioner': SelectPositionerProps;
  'Select.Popup': SelectPopupProps;
  'Select.Option': SelectOptionProps;
  'Select.Group': SelectGroupProps;
  'Select.GroupLabel': SelectGroupLabelProps;
  'Select.Arrow': SelectArrowProps;
}>;
