import type { ComponentDoc } from '../../docs-schema';
import type { DrawerBackdropProps } from './drawer-backdrop';
import type { DrawerCloseProps } from './drawer-close';
import type { DrawerDescriptionProps } from './drawer-description';
import type { DrawerHandleProps } from './drawer-handle-grip';
import type { DrawerPopupProps } from './drawer-popup';
import type { DrawerPortalProps } from './drawer-portal';
import type { DrawerProps } from './drawer-root';
import type { DrawerTitleProps } from './drawer-title';
import type { DrawerTriggerProps } from './drawer-trigger';
import type { DrawerViewportProps } from './drawer-viewport';

export default {
  name: 'Drawer',
  description:
    'Headless, unstyled bottom sheet with drag to dismiss, optional snap points, virtual keyboard handling and nesting. Shares the dialog behavior: portal, focus trap, scroll lock, dismissal and transitions. Ships no CSS: it writes `--cl-drawer-*` custom properties and `data-*` attributes for a styled layer to compose. `createDrawerHandle()` connects a root to a trigger rendered outside it.',
  useFor: [
    'the base for a styled bottom sheet',
    'a sheet the user swipes down to dismiss',
    'a sheet that rests at snap points, such as half and full height',
  ],
  keywords: ['drawer', 'bottom sheet', 'sheet', 'swipe', 'drag to dismiss', 'snap points', 'mobile'],
  practices: [
    {
      do: false,
      text: 'Use the primitive in a feature. Use the styled `Drawer` from `src/components/drawer` instead.',
    },
    {
      do: true,
      text: 'Call `registerDrawerCssVars()` once in the styled layer so the drag custom properties do not inherit.',
    },
    {
      do: true,
      text: 'Set `data-drawer-no-drag` on any custom draggable inside the sheet. Native selects, range inputs, sliders and text selections are already excluded.',
    },
    {
      do: true,
      text: 'Pass `autoFocus` only when the sheet should focus its first field. By default focus goes to the sheet, so a touch open does not raise the keyboard.',
    },
    {
      do: true,
      text: 'Give `Drawer.Handle` a role and label if it should be announced. It is presentational; keyboard users close with Escape or `Drawer.Close`.',
    },
    { do: false, text: 'Use it for a centered modal with no drag gesture. Use `Dialog` instead.' },
  ],
  parts: {
    'Drawer.Root': {
      description: 'Holds the open, drag, snap and nesting state. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Whether the drawer is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the drawer is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: {
          type: '(open: boolean) => void',
          doc: 'Called with the new open state, including changes made through the handle.',
        },
        modal: { type: 'boolean', doc: 'Traps focus and blocks the rest of the page.', default: 'true' },
        handle: {
          type: 'DrawerHandle',
          doc: 'Connects a trigger rendered outside the root. From `createDrawerHandle()`.',
        },
        dismissible: {
          type: 'boolean',
          doc: 'Lets a drag past the threshold, an outside press or Escape close the drawer.',
          default: 'true',
        },
        handleOnly: {
          type: 'boolean',
          doc: 'Only a press that starts on `Drawer.Handle` starts a drag.',
          default: 'false',
        },
        snapPoints: { type: 'number[]', doc: 'Ascending viewport fractions, from 0 to 1, the sheet can rest at.' },
        activeSnapPoint: { type: 'number', doc: 'The index of the active snap point, when controlled.' },
        defaultActiveSnapPoint: {
          type: 'number',
          doc: 'The snap point index on open, when uncontrolled.',
          default: 'the last',
        },
        onActiveSnapPointChange: { type: '(index: number) => void', doc: 'Called with the new snap point index.' },
        repositionInputs: {
          type: 'boolean',
          doc: 'Keeps a focused field above the virtual keyboard.',
          default: 'true',
        },
        autoFocus: {
          type: 'boolean',
          doc: 'Moves focus to the first field on open instead of the sheet.',
          default: 'false',
        },
      },
    },
    'Drawer.Trigger': {
      description: 'A `button` that opens the drawer. Carries `data-open` or `data-closed`.',
      props: { handle: { type: 'DrawerHandle', doc: 'Drives a root rendered elsewhere. Not needed inside a root.' } },
    },
    'Drawer.Portal': {
      description: 'Portals its children while the drawer is mounted.',
      props: {
        root: {
          type: 'HTMLElement | null | React.RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `PortalProvider` container, else `document.body`',
        },
      },
    },
    'Drawer.Backdrop': {
      description:
        'A `div` behind the sheet. Carries `data-open` or `data-closed` and `data-swiping`, and gets `--cl-drawer-swipe-progress` to fade with the drag.',
    },
    'Drawer.Viewport': {
      description: 'A fixed full-viewport `div` that locks scroll. Carries `data-open` or `data-closed`.',
      props: { lockScroll: { type: 'boolean', doc: 'Locks body scroll while open.', default: 'true' } },
    },
    'Drawer.Popup': {
      description:
        'The sheet, a `role="dialog"` `div` that hosts the drag and the focus trap. Carries `data-swiping`, `data-snap`, `data-expanded`, `data-nested`, `data-nested-drawer-open` and `data-nested-drawer-swiping`, and the `--cl-drawer-*` drag, snap and nesting properties.',
      props: {
        finalFocus: {
          type: 'FocusTarget',
          doc: 'Where focus goes on close: `true`, `false`, a ref, or a function of the interaction type.',
          default: 'the trigger',
        },
      },
    },
    'Drawer.Handle': {
      description: 'The drag grip, a `div` with `data-drawer-handle`. The only drag target with `handleOnly`.',
    },
    'Drawer.Title': { description: 'An `h2` that names the sheet through `aria-labelledby`.' },
    'Drawer.Description': { description: 'A `p` that describes the sheet through `aria-describedby`.' },
    'Drawer.Close': { description: 'A `button` that closes the drawer.' },
  },
  examples: [
    {
      title: 'A sheet with snap points',
      code: `
<Drawer.Root snapPoints={[0.4, 1]} defaultActiveSnapPoint={0}>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Handle />
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Close>Done</Drawer.Close>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
`,
    },
  ],
  related: ['Dialog'],
} satisfies ComponentDoc<{
  'Drawer.Root': DrawerProps;
  'Drawer.Trigger': DrawerTriggerProps;
  'Drawer.Portal': DrawerPortalProps;
  'Drawer.Backdrop': DrawerBackdropProps;
  'Drawer.Viewport': DrawerViewportProps;
  'Drawer.Popup': DrawerPopupProps;
  'Drawer.Handle': DrawerHandleProps;
  'Drawer.Title': DrawerTitleProps;
  'Drawer.Description': DrawerDescriptionProps;
  'Drawer.Close': DrawerCloseProps;
}>;
