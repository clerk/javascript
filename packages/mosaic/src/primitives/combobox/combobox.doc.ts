import type { ComponentDoc } from '../../docs-schema';
import type { ComboboxArrowProps } from './combobox-arrow';
import type { ComboboxClearProps } from './combobox-clear';
import type { ComboboxCollectionProps } from './combobox-collection';
import type { ComboboxEmptyProps } from './combobox-empty';
import type { ComboboxInputProps } from './combobox-input';
import type { ComboboxInputGroupProps } from './combobox-input-group';
import type { ComboboxListProps } from './combobox-list';
import type { ComboboxOptionProps } from './combobox-option';
import type { ComboboxOptionIndicatorProps } from './combobox-option-indicator';
import type { ComboboxPopupProps } from './combobox-popup';
import type { ComboboxPortalProps } from './combobox-portal';
import type { ComboboxPositionerProps } from './combobox-positioner';
import type { ComboboxProps } from './combobox-root';
import type { ComboboxTriggerProps } from './combobox-trigger';

export default {
  name: 'Combobox',
  description:
    'Headless, unstyled single-select input: typing searches the options and choosing one keeps its value. Focus stays on the input while the arrow keys move a virtual highlight. Given `items`, it filters them by label and shows `Empty` when none match.',
  useFor: [
    'the base for a styled select with search',
    'picking one value from a long list by typing',
    'a search field inside a popover that picks one value',
  ],
  keywords: ['combobox', 'select', 'searchable select', 'typeahead', 'listbox', 'picker', 'filter'],
  practices: [
    {
      do: false,
      text: 'Use the primitive in a feature. Use the styled `Combobox` from `src/components/combobox` instead.',
    },
    {
      do: true,
      text: 'Pass `items` and `itemToStringLabel` on the root, render options through `Combobox.Collection`, and annotate its `children` parameter with the item type.',
    },
    { do: true, text: 'Keep `Combobox.Empty` mounted, so screen readers announce the message when it appears.' },
    {
      do: true,
      text: 'Pass a localized `aria-label` to `Combobox.Trigger`, and to `Combobox.Clear`, which defaults to an English `Clear`.',
    },
    {
      do: true,
      text: 'Pass `defaultInputValue` when an initial selection has a label that differs from its value.',
    },
    {
      do: true,
      text: 'For search inside another popup, pass `inline`, render `Combobox.List`, and bind `open` to the outer popup.',
    },
    { do: false, text: 'Pass `id` to an option or the list. The primitive owns them to wire the ARIA pairing.' },
  ],
  parts: {
    'Combobox.Root': {
      description:
        'Holds the search text, the selected value and the open state. Renders no element. Closing restores the selected label in the input; clearing the input clears the selection.',
      props: {
        items: {
          type: 'readonly Item[]',
          doc: 'Every option item. `Collection` renders the ones whose label contains the search text.',
        },
        itemToStringLabel: {
          type: '(item: Item) => string',
          doc: 'The label `items` are searched by. Required with `items`.',
        },
        value: { type: 'string | null', doc: 'The selected value, or `null` for none, when controlled.' },
        defaultValue: {
          type: 'string | null',
          doc: 'The selected value on mount, when uncontrolled.',
          default: 'null',
        },
        onValueChange: {
          type: '(value: string | null) => void',
          doc: 'Called with the selected value, or `null` when cleared.',
        },
        inputValue: { type: 'string', doc: 'The search text, when controlled.' },
        defaultInputValue: { type: 'string', doc: 'The search text on mount, when uncontrolled.', default: "''" },
        onInputValueChange: { type: '(value: string) => void', doc: 'Called with the new search text.' },
        open: { type: 'boolean', doc: 'Whether the popup is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the popup is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: { type: 'Placement', doc: 'Floating UI placement of the positioner.', default: "'bottom-start'" },
        sideOffset: { type: 'number', doc: 'Gap in px between the anchor and the positioner.', default: '4' },
        inline: {
          type: 'boolean',
          doc: 'A search input inside another surface. Selecting clears the search instead of showing the label.',
        },
        openOnInputClick: {
          type: 'boolean',
          doc: 'Opens the popup when the input is clicked. No effect with `inline`.',
        },
      },
    },
    'Combobox.Input': {
      description:
        'An `input` with `aria-autocomplete="list"`. Typing opens the popup and highlights the first option; Enter selects the highlighted one. Carries `data-open` or `data-closed`.',
    },
    'Combobox.InputGroup': {
      description:
        'A `div` around the input and its buttons. The popup anchors to it, and a press inside it does not close the popup.',
    },
    'Combobox.Trigger': {
      description:
        'A `button`, out of the tab order, that toggles the popup and keeps focus on the input. Carries `aria-expanded`, `aria-haspopup="listbox"`, and `data-open` or `data-closed`.',
    },
    'Combobox.Clear': {
      description:
        'A `button`, out of the tab order, that clears the search and selection and focuses the input. Renders only while there is text or a selection.',
    },
    'Combobox.Portal': {
      description: 'Portals its children while the popup is mounted.',
      props: {
        root: { type: 'HTMLElement | null | React.RefObject<HTMLElement | null>', doc: 'The element to portal into.' },
      },
    },
    'Combobox.Positioner': {
      description:
        'The floating `div`, matched to the anchor width and capped at the available height. Carries `data-side`. Closes on Escape or an outside press.',
      props: {
        anchor: {
          type: 'HTMLElement | null',
          doc: 'The element to position against.',
          default: 'the `InputGroup`, then the input',
        },
      },
    },
    'Combobox.Popup': {
      description:
        'Wraps the options with transition attributes. Its children stay frozen while it closes, so the list does not change mid-exit.',
    },
    'Combobox.List': {
      description:
        'An inline listbox, used in place of `Positioner` and `Popup` inside another surface. Escape and outside presses pass to that surface.',
    },
    'Combobox.Collection': {
      description:
        'Renders the root `items` that match the search. Renders all of them when the input shows the selected label.',
      props: {
        children: {
          type: '(item: Item) => ReactNode',
          doc: 'Renders one item. Annotate the parameter with the item type.',
        },
      },
    },
    'Combobox.Option': {
      description:
        'One `role="option"`. Carries `data-selected`, `data-active` while highlighted, and `data-disabled`. A click selects it and returns focus to the input.',
      props: {
        value: { type: 'string', doc: 'The value passed to `onValueChange`.' },
        label: { type: 'string', doc: 'The text shown in the input once selected.', default: '`value`' },
        disabled: { type: 'boolean', doc: 'Skips the option on Enter and ignores clicks.' },
      },
    },
    'Combobox.OptionIndicator': {
      description: 'An `aria-hidden` `span` that renders only inside the selected option, such as a check mark.',
    },
    'Combobox.Empty': {
      description:
        'A polite `role="status"` region that shows its children only when no `items` match. Without `items` on the root it always shows them.',
    },
    'Combobox.Arrow': {
      description: 'An optional `svg` arrow pointing at the anchor, from Floating UI. Carries `data-side`.',
    },
  },
  examples: [
    {
      title: 'Search a list',
      code: `
<Combobox.Root items={fruits} itemToStringLabel={fruit => fruit}>
  <Combobox.InputGroup>
    <Combobox.Input aria-label='Fruit' />
    <Combobox.Trigger aria-label='Show fruits' />
  </Combobox.InputGroup>
  <Combobox.Positioner>
    <Combobox.Popup>
      <Combobox.Empty>No fruit found</Combobox.Empty>
      <Combobox.Collection>
        {(fruit: string) => (
          <Combobox.Option key={fruit} value={fruit}>
            {fruit}
            <Combobox.OptionIndicator>✓</Combobox.OptionIndicator>
          </Combobox.Option>
        )}
      </Combobox.Collection>
    </Combobox.Popup>
  </Combobox.Positioner>
</Combobox.Root>
`,
    },
  ],
  related: ['Autocomplete', 'Select'],
} satisfies ComponentDoc<{
  'Combobox.Root': ComboboxProps;
  'Combobox.Input': ComboboxInputProps;
  'Combobox.InputGroup': ComboboxInputGroupProps;
  'Combobox.Trigger': ComboboxTriggerProps;
  'Combobox.Clear': ComboboxClearProps;
  'Combobox.Portal': ComboboxPortalProps;
  'Combobox.Positioner': ComboboxPositionerProps;
  'Combobox.Popup': ComboboxPopupProps;
  'Combobox.List': ComboboxListProps;
  'Combobox.Collection': ComboboxCollectionProps<unknown>;
  'Combobox.Option': ComboboxOptionProps;
  'Combobox.OptionIndicator': ComboboxOptionIndicatorProps;
  'Combobox.Empty': ComboboxEmptyProps;
  'Combobox.Arrow': ComboboxArrowProps;
}>;
