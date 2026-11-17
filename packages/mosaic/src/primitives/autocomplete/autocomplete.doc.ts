import type { ComponentDoc } from '../../docs-schema';
import type { AutocompleteArrowProps } from './autocomplete-arrow';
import type { AutocompleteInputProps } from './autocomplete-input';
import type { AutocompleteListProps } from './autocomplete-list';
import type { AutocompleteOptionProps } from './autocomplete-option';
import type { AutocompletePopupProps } from './autocomplete-popup';
import type { AutocompletePortalProps } from './autocomplete-portal';
import type { AutocompletePositionerProps } from './autocomplete-positioner';
import type { AutocompleteProps } from './autocomplete-root';

export default {
  name: 'Autocomplete',
  description:
    'Headless, unstyled text input with a list of suggestions the caller filters. Focus stays on the input while the arrow keys move a virtual highlight through the options via `aria-activedescendant`. Selecting an option sets the input text to its label and closes the list.',
  useFor: [
    'a search input with suggestions',
    'typing to narrow a list of options',
    'a filterable list inside a popover or dialog',
  ],
  keywords: ['autocomplete', 'typeahead', 'suggestions', 'search', 'combobox', 'filter', 'listbox'],
  practices: [
    {
      do: true,
      text: 'Filter the options yourself from `inputValue`. The primitive does not filter.',
    },
    {
      do: true,
      text: 'Inside a popover or dialog, render `Autocomplete.List` in place of `Positioner` and `Popup`, and let the outer surface own visibility, Escape and outside clicks.',
    },
    { do: false, text: 'Pass `id` to an option or the list. The primitive owns them to wire the ARIA pairing.' },
    { do: false, text: 'Use it to pick from a fixed list. Use `Select`, or `Combobox` to pick with search.' },
  ],
  parts: {
    'Autocomplete.Root': {
      description:
        'Holds the input text, the selected value and the open state. Renders no element. Typing a non-empty string opens the list and highlights the first option; clearing the input closes it.',
      props: {
        inputValue: { type: 'string', doc: 'The input text, when controlled.' },
        defaultInputValue: { type: 'string', doc: 'The input text on mount, when uncontrolled.', default: "''" },
        onInputValueChange: {
          type: '(value: string) => void',
          doc: 'Called with the new input text, including the label of a selected option.',
        },
        value: { type: 'string', doc: 'The selected option value, when controlled.' },
        defaultValue: { type: 'string', doc: 'The selected option value on mount, when uncontrolled.' },
        onValueChange: { type: '(value: string) => void', doc: 'Called with the value of the selected option.' },
        open: { type: 'boolean', doc: 'Whether the list is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the list is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: { type: 'Placement', doc: 'Floating UI placement of the positioner.', default: "'bottom-start'" },
        sideOffset: { type: 'number', doc: 'Gap in px between the input and the positioner.', default: '4' },
      },
    },
    'Autocomplete.Input': {
      description:
        'An `input` with `aria-autocomplete="list"`. Enter selects the highlighted option. Carries `data-open` or `data-closed`.',
    },
    'Autocomplete.Portal': {
      description: 'Portals its children while the list is mounted.',
      props: {
        root: { type: 'HTMLElement | null | React.RefObject<HTMLElement | null>', doc: 'The element to portal into.' },
      },
    },
    'Autocomplete.Positioner': {
      description:
        'The floating `div` placed against the input, matched to its width and capped at the available height. Carries `data-side`. Keeps focus on the input and closes on Escape or an outside click.',
    },
    'Autocomplete.Popup': {
      description:
        'Wraps the options with transition attributes. Its children stay frozen while it closes, so the list does not change mid-exit.',
    },
    'Autocomplete.List': {
      description:
        'An inline listbox, used in place of `Positioner` and `Popup` inside another floating surface. Escape and outside clicks pass to that surface.',
    },
    'Autocomplete.Option': {
      description:
        'One `role="option"`. Carries `data-selected`, `data-active` while highlighted, and `data-disabled`. A click selects it and returns focus to the input.',
      props: {
        value: { type: 'string', doc: 'The value passed to `onValueChange`.' },
        label: { type: 'string', doc: 'The text put in the input on selection.', default: '`value`' },
        disabled: { type: 'boolean', doc: 'Skips the option on Enter and ignores clicks.' },
      },
    },
    'Autocomplete.Arrow': {
      description: 'An optional `svg` arrow pointing at the input, from Floating UI. Carries `data-side`.',
    },
  },
  examples: [
    {
      title: 'A filtered list',
      code: `
<Autocomplete.Root inputValue={query} onInputValueChange={setQuery}>
  <Autocomplete.Input placeholder='Search' />
  <Autocomplete.Positioner>
    <Autocomplete.Popup>
      {matches.map(item => (
        <Autocomplete.Option key={item.id} value={item.id} label={item.name}>
          {item.name}
        </Autocomplete.Option>
      ))}
    </Autocomplete.Popup>
  </Autocomplete.Positioner>
</Autocomplete.Root>
`,
    },
  ],
  related: ['Combobox', 'Select', 'Popover'],
} satisfies ComponentDoc<{
  'Autocomplete.Root': AutocompleteProps;
  'Autocomplete.Input': AutocompleteInputProps;
  'Autocomplete.Portal': AutocompletePortalProps;
  'Autocomplete.Positioner': AutocompletePositionerProps;
  'Autocomplete.Popup': AutocompletePopupProps;
  'Autocomplete.List': AutocompleteListProps;
  'Autocomplete.Option': AutocompleteOptionProps;
  'Autocomplete.Arrow': AutocompleteArrowProps;
}>;
