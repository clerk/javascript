import type { ComponentDoc } from '../../docs-schema';
import type { ComboboxCollectionProps } from '../../primitives/combobox/combobox-collection';
import type {
  ComboboxClearProps,
  ComboboxDetailProps,
  ComboboxEmptyProps,
  ComboboxInputGroupProps,
  ComboboxInputProps,
  ComboboxLabelProps,
  ComboboxListProps,
  ComboboxMediaProps,
  ComboboxOptionIndicatorProps,
  ComboboxOptionProps,
  ComboboxPopupProps,
  ComboboxRootProps,
  ComboboxTriggerProps,
} from './combobox';

export default {
  name: 'Combobox',
  description:
    'A styled single-select input that searches its options as the user types. Wraps the headless `Combobox` primitive; the popup portals and positions itself.',
  useFor: [
    'picking one option from a long list by typing to search',
    'a country or language picker',
    'a search list inside another popup, with `inline` and `Combobox.List`',
  ],
  keywords: ['combobox', 'select', 'autocomplete', 'typeahead', 'search', 'picker', 'dropdown', 'listbox'],
  practices: [
    {
      do: true,
      text: 'Pass `items` and `itemToStringLabel` to `Combobox.Root` and render options with `Combobox.Collection`, so the search filters them.',
    },
    { do: true, text: 'Keep `Combobox.Empty` mounted, so screen readers announce it when nothing matches.' },
    {
      do: true,
      text: 'Wrap the input and its buttons in `Combobox.InputGroup`, so the popup lines up with the whole group.',
    },
    { do: true, text: "Pass `defaultInputValue` when an initial selection's label differs from its value." },
    {
      do: true,
      text: 'Give `Combobox.Input` and `Combobox.Trigger` a localized accessible name, and `Combobox.Clear` a localized `aria-label`.',
    },
  ],
  parts: {
    'Combobox.Root': {
      description:
        'Holds the open state, the search text and the selected value. Clearing the input selects `null`. Renders no element.',
      props: {
        items: {
          type: 'readonly Item[]',
          doc: "Every option's item. `Collection` renders those that match the search.",
        },
        itemToStringLabel: { type: '(item: Item) => string', doc: 'The label an item is searched by.' },
        value: { type: 'string | null', doc: 'The selected value, when controlled.' },
        defaultValue: { type: 'string | null', doc: 'The selected value on mount.', default: 'null' },
        onValueChange: {
          type: '(value: string | null) => void',
          doc: 'Called with the new value, or `null` when cleared.',
        },
        inputValue: { type: 'string', doc: 'The search text, when controlled.' },
        defaultInputValue: { type: 'string', doc: 'The search text on mount.', default: "''" },
        onInputValueChange: { type: '(value: string) => void', doc: 'Called with the new search text.' },
        open: { type: 'boolean', doc: 'Whether the popup is open, when controlled.' },
        defaultOpen: { type: 'boolean', doc: 'Whether the popup is open on mount.', default: 'false' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called when the popup opens or closes.' },
        placement: {
          type: "'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end'",
          doc: 'Popup placement.',
          default: "'bottom-start'",
        },
        sideOffset: { type: 'number', doc: 'Gap between the anchor and the popup, in px.', default: '8' },
        inline: {
          type: 'boolean',
          doc: 'Search inside another surface. Bind `open` to that surface and use `Combobox.List`.',
        },
        openOnInputClick: {
          type: 'boolean',
          doc: 'Opens the popup when the input is clicked. No effect with `inline`.',
          default: 'true',
        },
      },
    },
    'Combobox.Collection': {
      description: "Renders the root's `items` that match the search text, case-insensitively. Renders no element.",
      props: {
        children: {
          type: '(item: Item) => ReactNode',
          doc: 'Renders one item. Annotate the parameter with the item type.',
        },
      },
    },
    'Combobox.InputGroup': {
      description:
        'An `InputGroup.Root` around the input and its buttons. The popup anchors to it, and pressing inside it keeps the popup open.',
    },
    'Combobox.Input': {
      description:
        'The search `input`, rendered as `Input`. Inside an input group it is `ghost` and takes the group size.',
      slot: 'cl-combobox-input',
      props: {
        size: { type: 'ComboboxSize', doc: '`sm`, `md` or `lg`. Ignored inside an input group.', default: "'md'" },
        variant: {
          type: 'InputVariant',
          doc: 'The `Input` variant.',
          default: '`ghost` in an input group, else `default`',
        },
      },
    },
    'Combobox.Trigger': {
      description: 'A `Button` that toggles the popup. Shows a chevron when given no children.',
      slot: 'cl-combobox-trigger',
    },
    'Combobox.Clear': {
      description:
        "A `Button` that clears the search and the selection. Out of the tab order, with the default `aria-label` 'Clear'. Shows an X when given no children.",
      slot: 'cl-combobox-clear',
    },
    'Combobox.Popup': {
      description:
        'The floating, scrollable listbox. Portals and positions itself; the positioner carries `cl-combobox-positioner` and the scroll box `cl-combobox-viewport`.',
      slot: 'cl-combobox-popup',
      props: {
        anchor: {
          type: "React.ComponentPropsWithoutRef<typeof HeadlessCombobox.Positioner>['anchor']",
          doc: 'Positions the popup against this instead of the input group or input.',
        },
        portalRoot: {
          type: "React.ComponentPropsWithoutRef<typeof HeadlessCombobox.Portal>['root']",
          doc: 'Where the popup portals.',
          default: '`document.body`',
        },
      },
    },
    'Combobox.List': {
      description: 'A scrollable listbox in flow, for a combobox embedded in another surface. Turns on inline mode.',
      slot: 'cl-combobox-list',
    },
    'Combobox.Option': {
      description: 'One option.',
      slot: 'cl-combobox-option',
      props: {
        value: { type: 'string', doc: 'The value selected when the option is chosen.' },
        label: { type: 'string', doc: 'The text typeahead matches.', default: '`value`' },
        disabled: { type: 'boolean', doc: 'Makes the option unselectable.' },
      },
    },
    'Combobox.Media': {
      description: 'A square leading column for an icon, flag or avatar, as a `span`.',
      slot: 'cl-combobox-option-media',
    },
    'Combobox.Label': {
      description: "The option's name, as a `span`. Truncates to one line.",
      slot: 'cl-combobox-option-label',
    },
    'Combobox.Detail': {
      description: 'Secondary trailing text, such as a code or count. Stays whole while the label truncates.',
      slot: 'cl-combobox-option-detail',
    },
    'Combobox.OptionIndicator': {
      description: 'Shows on the selected option. A checkmark when given no children.',
      slot: 'cl-combobox-option-indicator',
    },
    'Combobox.Empty': {
      description: 'A polite `role="status"` region that shows its children only when nothing matches.',
      slot: 'cl-combobox-empty',
    },
  },
  examples: [
    {
      title: 'A searchable picker',
      code: `
<Combobox.Root items={countries} itemToStringLabel={country => country.name}>
  <Combobox.InputGroup>
    <Combobox.Input aria-label={m.country} />
    <Combobox.Trigger aria-label={m.showCountries} />
  </Combobox.InputGroup>
  <Combobox.Popup>
    <Combobox.Empty>{m.noResults}</Combobox.Empty>
    <Combobox.Collection>
      {(country: Country) => (
        <Combobox.Option key={country.code} value={country.code} label={country.name}>
          <Combobox.Label>{country.name}</Combobox.Label>
          <Combobox.OptionIndicator />
        </Combobox.Option>
      )}
    </Combobox.Collection>
  </Combobox.Popup>
</Combobox.Root>
`,
    },
  ],
  related: ['InputGroup', 'Input', 'Menu'],
} satisfies ComponentDoc<{
  'Combobox.Root': ComboboxRootProps;
  'Combobox.Collection': ComboboxCollectionProps<unknown>;
  'Combobox.InputGroup': ComboboxInputGroupProps;
  'Combobox.Input': ComboboxInputProps;
  'Combobox.Trigger': ComboboxTriggerProps;
  'Combobox.Clear': ComboboxClearProps;
  'Combobox.Popup': ComboboxPopupProps;
  'Combobox.List': ComboboxListProps;
  'Combobox.Option': ComboboxOptionProps;
  'Combobox.Media': ComboboxMediaProps;
  'Combobox.Label': ComboboxLabelProps;
  'Combobox.Detail': ComboboxDetailProps;
  'Combobox.OptionIndicator': ComboboxOptionIndicatorProps;
  'Combobox.Empty': ComboboxEmptyProps;
}>;
