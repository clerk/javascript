import type { ComponentDoc } from '../../docs-schema';
import type {
  DrawerCloseProps,
  DrawerDescriptionProps,
  DrawerPopupProps,
  DrawerRootProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './drawer';

export default {
  name: 'Drawer',
  description:
    'A bottom sheet that rises from the bottom of the screen, with a scrim and a grip. Drag it down, press Escape or press outside to dismiss. Wraps the headless `Drawer` primitive.',
  useFor: [
    'a bottom sheet on a small screen',
    'a draggable panel with snap points',
    'a sheet opened from inside a card or profile dialog',
  ],
  keywords: ['drawer', 'bottom sheet', 'sheet', 'panel', 'modal', 'snap points', 'swipe'],
  practices: [
    { do: true, text: 'Name the sheet with `Drawer.Title`, and describe it with `Drawer.Description`.' },
    {
      do: true,
      text: 'Pass `autoFocus` only when the sheet opens to a field the user types in at once. It is off so opening on touch does not raise the keyboard.',
    },
  ],
  parts: {
    'Drawer.Root': {
      description: 'Holds the open state, dismissal, snap points and drag policy. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Whether the sheet is open, when controlled.' },
        defaultOpen: { type: 'boolean', doc: 'Whether the sheet is open on mount.' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called when the sheet opens or closes.' },
        modal: { type: 'boolean', doc: 'Traps focus and blocks the rest of the page.', default: 'true' },
        handle: {
          type: "HeadlessDrawerProps['handle']",
          doc: 'Imperative handle for a trigger rendered outside `Drawer.Root`.',
        },
        snapPoints: { type: 'number[]', doc: 'Ascending fractions (0 to 1) of the viewport the sheet rests at.' },
        activeSnapPoint: { type: 'number', doc: 'The active snap point index, when controlled.' },
        defaultActiveSnapPoint: {
          type: 'number',
          doc: 'The active snap point index on mount.',
          default: 'the last, most open',
        },
        onActiveSnapPointChange: { type: '(index: number) => void', doc: 'Called with the new snap point index.' },
        dismissible: {
          type: 'boolean',
          doc: 'Lets a downward release past the threshold, or an outside press, close it.',
          default: 'true',
        },
        handleOnly: { type: 'boolean', doc: 'Starts a drag only from the grip.', default: 'false' },
        repositionInputs: {
          type: 'boolean',
          doc: 'Keeps a focused field above the virtual keyboard.',
          default: 'true',
        },
        autoFocus: { type: 'boolean', doc: 'Moves focus into the sheet on open.', default: 'false' },
      },
    },
    'Drawer.Trigger': { description: 'The headless trigger button that opens the sheet.' },
    'Drawer.Popup': {
      description:
        'The sheet, with its portal, viewport (`cl-drawer-viewport`), scrim (`cl-drawer-backdrop`, `data-nested` inside a dialog), grip (`cl-drawer-handle`, `cl-drawer-grip`) and content box (`cl-drawer-content`).',
      slot: 'cl-drawer-popup',
      props: {
        finalFocus: {
          type: 'DrawerFocusTarget',
          doc: 'Where focus returns when the sheet closes.',
          default: 'the trigger',
        },
      },
    },
    'Drawer.Title': { description: 'The headless title the sheet is labelled by.' },
    'Drawer.Description': { description: 'The headless description the sheet is described by.' },
    'Drawer.Close': { description: 'The headless button that closes the sheet from inside.' },
  },
  examples: [
    {
      title: 'A sheet',
      code: `
<Drawer.Root>
  <Drawer.Trigger>{m.open}</Drawer.Trigger>
  <Drawer.Popup>
    <Drawer.Title>{m.title}</Drawer.Title>
    <Drawer.Description>{m.description}</Drawer.Description>
    <Drawer.Close>{m.done}</Drawer.Close>
  </Drawer.Popup>
</Drawer.Root>
`,
    },
  ],
  related: ['Dialog'],
} satisfies ComponentDoc<{
  'Drawer.Root': DrawerRootProps;
  'Drawer.Trigger': DrawerTriggerProps;
  'Drawer.Popup': DrawerPopupProps;
  'Drawer.Title': DrawerTitleProps;
  'Drawer.Description': DrawerDescriptionProps;
  'Drawer.Close': DrawerCloseProps;
}>;
