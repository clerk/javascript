import type { ComponentDoc } from '../../docs-schema';
import type { PopoverArrowProps } from './popover-arrow';
import type { PopoverCloseProps } from './popover-close';
import type { PopoverDescriptionProps } from './popover-description';
import type { PopoverPopupProps } from './popover-popup';
import type { PopoverPortalProps } from './popover-portal';
import type { PopoverPositionerProps } from './popover-positioner';
import type { PopoverProps } from './popover-root';
import type { PopoverTitleProps } from './popover-title';
import type { PopoverTriggerProps } from './popover-trigger';

export default {
  name: 'Popover',
  description:
    'Headless, unstyled floating panel anchored to a trigger, non-modal by default. Wires `role="dialog"`, the trigger’s `aria-expanded` and `aria-controls`, and focus on open and close.',
  useFor: [
    'a floating panel of interactive content anchored to a button',
    'a filter or settings panel that leaves the page usable',
    'a nested popover inside another floating surface',
  ],
  keywords: ['popover', 'floating', 'anchored', 'flyout', 'dropdown panel', 'overlay'],
  practices: [
    {
      do: true,
      text: 'Render `Popover.Title` and `Popover.Description`. They label and describe the positioner only when present.',
    },
    {
      do: true,
      text: 'Animate with `data-starting-style` and `data-ending-style` on `Popover.Popup`. Its children freeze on their last frame while it closes.',
    },
    { do: true, text: "Set `initialFocus='first'` when the content is meant to be typed into straight away." },
    { do: false, text: 'Pass `id` to `Popover.Title` or `Popover.Description`. The primitive owns both.' },
    { do: false, text: 'Use it for a list of actions or hover-only hints. Use `Menu` or `Tooltip` instead.' },
  ],
  parts: {
    'Popover.Root': {
      description: 'Holds the open state, placement and dismissal. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Whether the popover is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the popover is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: { type: 'Placement', doc: 'Where the popup sits against its anchor.', default: "'bottom'" },
        sideOffset: { type: 'number', doc: 'Gap to the anchor in px.', default: '4' },
        alignOffset: { type: 'number', doc: 'Nudge along the alignment axis in px.', default: '0' },
        modal: { type: 'boolean', doc: 'Traps focus inside the popup.', default: 'false' },
        initialFocus: {
          type: "'auto' | 'first'",
          doc: '`auto` focuses the first tabbable on a keyboard open and the popup on a pointer open. `first` always focuses the first tabbable.',
          default: "'auto'",
        },
      },
    },
    'Popover.Trigger': { description: 'A `button` that toggles the popover. Carries `data-open` or `data-closed`.' },
    'Popover.Portal': {
      description: 'Portals its children while the popover is mounted.',
      props: {
        root: {
          type: 'HTMLElement | null | React.RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `Portal` container',
        },
      },
    },
    'Popover.Positioner': {
      description:
        'The floating `div` with `role="dialog"`. Carries `data-side` and the `--cl-anchor-*`, `--cl-available-*` and `--cl-transform-origin` variables, and manages focus.',
      props: { anchor: { type: 'HTMLElement | null', doc: 'Positions against this element instead of the trigger.' } },
    },
    'Popover.Popup': {
      description:
        'Wraps the content. Carries `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`.',
    },
    'Popover.Arrow': {
      description: 'An optional `FloatingArrow` `svg` pointing at the anchor. Carries `data-side`.',
    },
    'Popover.Title': { description: 'An `h2` that labels the positioner.' },
    'Popover.Description': { description: 'A `p` that describes the positioner.' },
    'Popover.Close': { description: 'A `button` that closes the popover.' },
  },
  examples: [
    {
      title: 'Settings panel',
      code: `
<Popover.Root>
  <Popover.Trigger>Settings</Popover.Trigger>
  <Popover.Positioner>
    <Popover.Popup>
      <Popover.Title>Preferences</Popover.Title>
      <Popover.Close>Done</Popover.Close>
    </Popover.Popup>
  </Popover.Positioner>
</Popover.Root>
`,
    },
  ],
  related: ['Menu', 'Tooltip', 'Portal'],
} satisfies ComponentDoc<{
  'Popover.Root': PopoverProps;
  'Popover.Trigger': PopoverTriggerProps;
  'Popover.Portal': PopoverPortalProps;
  'Popover.Positioner': PopoverPositionerProps;
  'Popover.Popup': PopoverPopupProps;
  'Popover.Arrow': PopoverArrowProps;
  'Popover.Title': PopoverTitleProps;
  'Popover.Description': PopoverDescriptionProps;
  'Popover.Close': PopoverCloseProps;
}>;
