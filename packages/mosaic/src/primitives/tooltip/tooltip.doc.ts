import type { ComponentDoc } from '../../docs-schema';
import type { TooltipArrowProps } from './tooltip-arrow';
import type { TooltipGroupProps } from './tooltip-group';
import type { TooltipPopupProps } from './tooltip-popup';
import type { TooltipPortalProps } from './tooltip-portal';
import type { TooltipPositionerProps } from './tooltip-positioner';
import type { TooltipProps } from './tooltip-root';
import type { TooltipTriggerProps } from './tooltip-trigger';

export default {
  name: 'Tooltip',
  description:
    'Headless, unstyled floating label that opens on hover after a delay or on keyboard focus, and closes on leave, blur or `Escape`. It never takes focus and holds no interactive content.',
  useFor: [
    'a label for an icon-only button',
    'the full text of truncated content',
    'a short hint shown on hover or focus',
    'a toolbar whose tooltips switch instantly as the pointer moves',
  ],
  keywords: ['tooltip', 'hint', 'hover', 'label', 'floating', 'describedby'],
  practices: [
    {
      do: true,
      text: 'Wrap a cluster of triggers, such as a toolbar, in `Tooltip.Group` so moving between them switches at once.',
    },
    {
      do: true,
      text: 'Pass the trigger’s own button through `render` instead of nesting a button inside `Tooltip.Trigger`.',
    },
    { do: true, text: 'Animate the popup with `data-starting-style` and `data-ending-style`.' },
    { do: false, text: 'Put links or buttons in the popup. It cannot be reached by keyboard. Use `Popover` instead.' },
    {
      do: false,
      text: 'Use the tooltip as a button’s only name. Give the trigger its own `aria-label`; the tooltip only describes it.',
    },
    {
      do: false,
      text: 'Pass `id` to `Tooltip.Positioner`. The primitive owns it to pair the trigger’s `aria-describedby`.',
    },
  ],
  parts: {
    'Tooltip.Root': {
      description:
        'Holds the open state, position and hover delays. Renders no element. Nested tooltips are supported.',
      props: {
        open: { type: 'boolean', doc: 'Whether the tooltip is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the tooltip is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: { type: 'Placement', doc: 'Where the tooltip sits relative to the trigger.', default: "'top'" },
        sideOffset: { type: 'number', doc: 'Gap to the trigger in px.', default: '4' },
        delay: { type: 'number', doc: 'Hover open delay in ms. Ignored inside a `Tooltip.Group`.', default: '200' },
        closeDelay: { type: 'number', doc: 'Hover close delay in ms. Ignored inside a `Tooltip.Group`.', default: '0' },
      },
    },
    'Tooltip.Group': {
      description: 'Shares one delay across the tooltips inside it. Renders no element.',
      props: {
        delay: {
          type: 'number | { open?: number; close?: number }',
          doc: 'Open and close delay in ms. Replaces each member’s own.',
          default: '{ open: 200, close: 100 }',
        },
        timeoutMs: {
          type: 'number',
          doc: 'How long after a tooltip closes the next one still opens instantly, in ms.',
          default: '300',
        },
      },
    },
    'Tooltip.Trigger': {
      description: 'A `button` with `aria-describedby` pointing at the tooltip. Carries `data-open` or `data-closed`.',
    },
    'Tooltip.Portal': {
      description: 'Portals its children while the tooltip is mounted.',
      props: {
        root: {
          type: 'HTMLElement | null | RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `Portal` container',
        },
      },
    },
    'Tooltip.Positioner': {
      description:
        'The floating `div` with `role="tooltip"`, rendered only while mounted. Carries `data-side` and the anchor CSS variables.',
    },
    'Tooltip.Popup': {
      description:
        'The visible `div`. Carries `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`.',
    },
    'Tooltip.Arrow': {
      description: 'An optional `FloatingArrow` `svg` pointing at the trigger. Carries `data-side`.',
    },
  },
  examples: [
    {
      title: 'Icon button tooltip',
      code: `
<Tooltip.Root>
  <Tooltip.Trigger render={<IconButton aria-label='Settings' />} />
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup>
        Settings
        <Tooltip.Arrow />
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>
`,
    },
  ],
  related: ['Popover', 'Portal'],
} satisfies ComponentDoc<{
  'Tooltip.Root': TooltipProps;
  'Tooltip.Group': TooltipGroupProps;
  'Tooltip.Trigger': TooltipTriggerProps;
  'Tooltip.Portal': TooltipPortalProps;
  'Tooltip.Positioner': TooltipPositionerProps;
  'Tooltip.Popup': TooltipPopupProps;
  'Tooltip.Arrow': TooltipArrowProps;
}>;
