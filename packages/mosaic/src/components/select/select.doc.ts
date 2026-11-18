import type { ComponentDoc } from '../../docs-schema';
import type {
  SelectContentProps,
  SelectDescriptionProps,
  SelectLabelProps,
  SelectMediaProps,
  SelectOptionProps,
  SelectPopupProps,
  SelectProps,
  SelectTriggerProps,
} from './select';

export default {
  name: 'Select',
  description:
    'A dropdown that picks one value, or several with `multiple`, from a list of `items`. Keyboard navigation and typeahead; values can be any type and compare with `Object.is`. Inside a `Field` the trigger takes the field id, label, disabled, required, invalid and message wiring. Each part is also exported on its own, such as `SelectTrigger`.',
  useFor: [
    'picking one option from a list, such as a role',
    'picking several options from a list',
    'a compact dropdown in a table row',
    'options with an icon, avatar or description',
  ],
  keywords: ['select', 'dropdown', 'picker', 'listbox', 'combobox', 'menu', 'role'],
  practices: [
    { do: true, text: 'Pass every choice as `items` on the root, so the closed trigger can show the selected label.' },
    { do: true, text: "Use `variant='ghost'` and an `aria-label` for a trigger in a table row." },
    {
      do: true,
      text: 'Wrap it in `Field.Root` with a `Field.Label` in a form, instead of labelling the trigger by hand.',
    },
    { do: false, text: 'Use it when the user types to filter options. Use `Combobox` instead.' },
  ],
  parts: {
    'Select.Root': {
      description: 'Holds the selection and the items. Renders no element.',
      props: {
        items: {
          type: 'SelectItem<Value>[]',
          doc: '`{ value, label, description?, disabled? }` for every choice. `label` drives typeahead.',
        },
        multiple: {
          type: 'boolean',
          doc: 'Makes the value an array. Picking an option toggles it and keeps the popup open.',
          default: 'false',
        },
        value: { type: 'Value | Value[] | null', doc: 'The selection, when controlled. An array with `multiple`.' },
        defaultValue: { type: 'Value | Value[] | null', doc: 'The selection on mount, when uncontrolled.' },
        onValueChange: {
          type: '((value: Value) => void) | ((value: Value[]) => void)',
          doc: 'Called with the new selection.',
        },
        open: { type: 'boolean', doc: 'Open state, when controlled.' },
        defaultOpen: { type: 'boolean', doc: 'Open state on mount.', default: 'false' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        alignItemWithTrigger: {
          type: 'boolean',
          doc: 'Overlays the selected option on the trigger, like a native `select`. Falls back below the trigger on touch or near an edge.',
          default: 'true, or false when `multiple` or any item has a description',
        },
        placement: {
          type: "'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end'",
          doc: 'Side and alignment when not aligned with the trigger.',
          default: "'bottom-start'",
        },
        sideOffset: { type: 'number', doc: 'Gap in px between trigger and popup.', default: '4' },
      },
    },
    'Select.Trigger': {
      description:
        'Opens the listbox and shows the selected label, with a chevron (`cl-select-trigger-icon`). Renders a neutral `md` `Button`, or the `render` element. Carries `data-variant`, and `data-open` or `data-closed`.',
      slot: 'cl-select-trigger',
      props: {
        variant: {
          type: 'SelectTriggerVariant',
          doc: '`outline` for a form control, `ghost` for a dense surface such as a table row.',
          default: "'outline'",
        },
        placeholder: { type: 'React.ReactNode', doc: 'Shown while nothing is selected.' },
        children: {
          type: 'React.ReactNode | ((value: unknown[]) => React.ReactNode)',
          doc: 'A function receives the selected values and renders inside the value slot (`cl-select-value`); anything else replaces it.',
        },
      },
    },
    'Select.Popup': {
      description:
        "The floating `role='listbox'`, with a scrolling viewport (`cl-select-viewport`) in a positioner (`cl-select-positioner`). Renders one `Select.Option` per item unless given children.",
      slot: 'cl-select-popup',
      props: {
        portalRoot: {
          type: "SelectPortalProps['root']",
          doc: 'Container the listbox portals into.',
          default: 'document.body',
        },
      },
    },
    'Select.Option': {
      description:
        "One `role='option'` with a check (`cl-select-option-indicator`) when selected. Carries `data-selected`, `data-active`, `data-disabled`, and `data-described` when it has a description.",
      slot: 'cl-select-option',
      props: {
        value: { type: 'unknown', doc: 'The value this option selects.' },
        label: { type: 'string', doc: 'Shown in the row and the trigger; drives typeahead.' },
        description: { type: 'string', doc: 'A secondary line under the label.' },
        disabled: { type: 'boolean', doc: 'Keeps the option focusable but not selectable.' },
        children: {
          type: 'React.ReactNode',
          doc: 'Composes the row from `Select.Media` and `Select.Content`. Without it the row shows `label` and `description`.',
        },
      },
    },
    'Select.Media': {
      description: 'A square leading column for an icon, image or avatar.',
      slot: 'cl-select-option-media',
    },
    'Select.Content': {
      description: 'Stacks the label and description beside the media.',
      slot: 'cl-select-option-content',
    },
    'Select.Label': {
      description: "The option's name, on one line. Names the option.",
      slot: 'cl-select-option-label',
    },
    'Select.Description': {
      description: 'A secondary line under the label. Describes the option without joining its name.',
      slot: 'cl-select-option-description',
    },
  },
  examples: [
    {
      title: 'In a field',
      code: `
<Field.Root>
  <Field.Label>Role</Field.Label>
  <Select.Root items={roles} value={role} onValueChange={setRole}>
    <Select.Trigger placeholder={m.rolePlaceholder} />
    <Select.Popup />
  </Select.Root>
</Field.Root>
`,
    },
    {
      title: 'In a table row',
      code: `
<Select.Root items={roles} value={member.role} onValueChange={onChangeRole}>
  <Select.Trigger variant='ghost' aria-label={label} />
  <Select.Popup />
</Select.Root>
`,
    },
  ],
  related: ['Field', 'Combobox'],
} satisfies ComponentDoc<{
  'Select.Root': SelectProps;
  'Select.Trigger': SelectTriggerProps;
  'Select.Popup': SelectPopupProps;
  'Select.Option': SelectOptionProps;
  'Select.Media': SelectMediaProps;
  'Select.Content': SelectContentProps;
  'Select.Label': SelectLabelProps;
  'Select.Description': SelectDescriptionProps;
}>;
