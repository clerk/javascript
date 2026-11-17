import type { ComponentDoc } from '../../docs-schema';
import type {
  PopoverCloseProps,
  PopoverDescriptionProps,
  PopoverPopupProps,
  PopoverRootProps,
  PopoverTitleProps,
  PopoverTriggerProps,
} from './popover';

export default {
  name: 'Popover',
  description:
    'A floating box anchored to a trigger, for content that is not a list of actions. The popup paints no surface of its own.',
  useFor: ['a small floating panel opened from a button', 'a picker or form in a floating box'],
  keywords: ['popover', 'floating', 'popup', 'flyout', 'overlay', 'anchored'],
  practices: [
    { do: true, text: 'Put a surface inside `Popover.Popup`, usually a `Card`.' },
    {
      do: true,
      text: 'Name the popup: render a `Popover.Title`, or pass `aria-label` or `aria-labelledby` to `Popover.Popup`. A dev warning fires otherwise.',
    },
    { do: true, text: "Pass `initialFocus='first'` when the content is typed into at once, such as a search." },
    { do: false, text: 'Use it for a list of actions. Use `Menu` instead.' },
    { do: false, text: 'Use it for a hint on hover. Use `Tooltip` instead.' },
  ],
  parts: {
    'Popover.Root': {
      description: 'Holds the open state and placement. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Whether the popover is open, when controlled.' },
        defaultOpen: { type: 'boolean', doc: 'Whether it starts open, when uncontrolled.', default: 'false' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: {
          type: "'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end'",
          doc: 'Side and alignment against the trigger or anchor.',
          default: "'bottom'",
        },
        sideOffset: { type: 'number', doc: 'Gap from the trigger, in px.', default: '4' },
        alignOffset: { type: 'number', doc: 'Shift along the trigger edge, in px.', default: '0' },
        modal: { type: 'boolean', doc: 'Traps focus inside the popup.', default: 'false' },
        initialFocus: {
          type: "'auto' | 'first'",
          doc: '`auto` focuses the first tabbable element after a key press and the popup after a pointer press. `first` always focuses the first tabbable element.',
          default: "'auto'",
        },
      },
    },
    'Popover.Trigger': {
      description: 'A `button` that toggles the popover. Pass `render` to use a `Button`.',
      slot: 'cl-popover-trigger',
    },
    'Popover.Popup': {
      description: 'Portals and positions the content. Resets `Button` defaults from any group around the trigger.',
      slot: 'cl-popover-popup',
      props: {
        size: {
          type: 'PopoverSize',
          doc: 'Width: `sm`, `md`, `lg`, or `anchor` to match the anchor width.',
          default: "'md'",
        },
        anchor: { type: 'HTMLElement | null', doc: 'Positions against this element instead of the trigger.' },
        'aria-label': { type: 'string', doc: 'The popup name. Needed unless the content renders a `Popover.Title`.' },
      },
    },
    'Popover.Title': { description: 'An `h2` that names the popup.' },
    'Popover.Description': { description: 'A `p` that describes the popup.' },
    'Popover.Close': { description: 'A `button` that closes the popover.' },
  },
  examples: [
    {
      title: 'A popover with a card',
      code: `
<Popover.Root>
  <Popover.Trigger render={props => <Button {...props} />}>Filters</Popover.Trigger>
  <Popover.Popup>
    <Card.Root>
      <Popover.Title>Filters</Popover.Title>
      …
    </Card.Root>
  </Popover.Popup>
</Popover.Root>
`,
    },
  ],
  related: ['Menu', 'Tooltip', 'Card', 'Dialog'],
} satisfies ComponentDoc<{
  'Popover.Root': PopoverRootProps;
  'Popover.Trigger': PopoverTriggerProps;
  'Popover.Popup': PopoverPopupProps;
  'Popover.Title': PopoverTitleProps;
  'Popover.Description': PopoverDescriptionProps;
  'Popover.Close': PopoverCloseProps;
}>;
