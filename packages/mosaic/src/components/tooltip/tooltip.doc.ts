import type { ComponentDoc } from '../../docs-schema';
import type { TooltipGroupProps } from '../../primitives/tooltip/tooltip-group';
import type { TooltipPopupProps, TooltipRootProps, TooltipTriggerProps } from './tooltip';

export default {
  name: 'Tooltip',
  description:
    'A short label that shows on hover or focus of its trigger, and closes on Escape. Styled over the headless `Tooltip` primitive; the popup portals and positions itself.',
  useFor: [
    'a label for an icon-only control',
    'a short hint on hover or focus',
    'a row of toolbar tooltips that open at once after the first',
  ],
  keywords: ['tooltip', 'hint', 'hover', 'label', 'popover'],
  practices: [
    {
      do: true,
      text: 'Wrap a toolbar of tooltips in `Tooltip.Group`, so moving between triggers opens the next at once.',
    },
    { do: true, text: 'Pass `render` to `Tooltip.Trigger` to make an existing `Button` the trigger.' },
    { do: false, text: 'Put interactive content in `Tooltip.Popup`. Use a popover or menu instead.' },
    {
      do: false,
      text: 'Rely on a tooltip as the only accessible name of an icon-only button. Give the button its own name with `VisuallyHidden` or `aria-label`.',
    },
  ],
  parts: {
    'Tooltip.Root': {
      description: 'Holds the open state and positioning. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Open state, when controlled.' },
        defaultOpen: { type: 'boolean', doc: 'Open state on mount, when uncontrolled.', default: 'false' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: {
          type: "'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end'",
          doc: 'Preferred side and alignment. Flips and shifts to stay in view.',
          default: "'top'",
        },
        sideOffset: { type: 'number', doc: 'Gap in px between trigger and popup.', default: '4' },
        delay: { type: 'number', doc: 'Ms before opening on hover. Ignored inside `Tooltip.Group`.', default: '200' },
        closeDelay: {
          type: 'number',
          doc: 'Ms before closing on hover out. Ignored inside `Tooltip.Group`.',
          default: '0',
        },
      },
    },
    'Tooltip.Group': {
      description: 'Shares one delay across the tooltips inside, so once one opens the next opens at once.',
      props: {
        delay: {
          type: 'number | { open?: number; close?: number }',
          doc: "Replaces each member's `delay` and `closeDelay`.",
          default: '{ open: 200, close: 100 }',
        },
        timeoutMs: {
          type: 'number',
          doc: 'Ms after the last close before the group waits for the delay again.',
          default: '300',
        },
      },
    },
    'Tooltip.Trigger': {
      description:
        "A `button` (`type='button'`) wired to open the tooltip and described by it. Carries `data-open` or `data-closed`.",
      slot: 'cl-tooltip-trigger',
    },
    'Tooltip.Popup': {
      description:
        'The label, as `role="tooltip"`. Portals, and sits in a positioner (`cl-tooltip-positioner`) with `data-side`. Mounts only while open.',
      slot: 'cl-tooltip-popup',
    },
  },
  examples: [
    {
      title: 'An icon button with a tooltip',
      code: `
<Tooltip.Root>
  <Tooltip.Trigger render={<Button variant='ghost' shape='square' />}>
    <Icon glyph={Copy} />
    <VisuallyHidden>Copy</VisuallyHidden>
  </Tooltip.Trigger>
  <Tooltip.Popup>Copy</Tooltip.Popup>
</Tooltip.Root>
`,
    },
  ],
  related: ['VisuallyHidden', 'Button'],
} satisfies ComponentDoc<{
  'Tooltip.Root': TooltipRootProps;
  'Tooltip.Group': TooltipGroupProps;
  'Tooltip.Trigger': TooltipTriggerProps;
  'Tooltip.Popup': TooltipPopupProps;
}>;
