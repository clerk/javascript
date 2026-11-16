import type { ComponentDoc } from '../../docs-schema';
import type { DialogBackdropProps } from './dialog-backdrop';
import type { DialogCloseProps } from './dialog-close';
import type { DialogDescriptionProps } from './dialog-description';
import type { DialogPopupProps } from './dialog-popup';
import type { DialogPortalProps } from './dialog-portal';
import type { DialogProps } from './dialog-root';
import type { DialogTitleProps } from './dialog-title';
import type { DialogTriggerProps } from './dialog-trigger';
import type { DialogViewportProps } from './dialog-viewport';

export default {
  name: 'Dialog',
  description:
    'Headless, unstyled dialog over the page, modal or not. Traps focus, locks scroll, wires `aria-labelledby` and `aria-describedby`, and keeps the popup mounted through its exit transition. Nested dialogs stack. `Dialog.createHandle()` connects a root to triggers rendered outside it.',
  useFor: [
    'the base for a styled modal or sheet',
    'a dialog opened from a trigger elsewhere in the tree',
    'one dialog that renders per-trigger content from a payload',
    'a dialog presented inline in a page slot',
  ],
  keywords: ['dialog', 'modal', 'alertdialog', 'overlay', 'focus trap', 'scroll lock', 'createHandle', 'payload'],
  practices: [
    {
      do: false,
      text: 'Use the primitive in a feature. Use the styled `Dialog` from `src/components/dialog` instead.',
    },
    { do: true, text: 'Render `Dialog.Popup` inside `Dialog.Viewport`, which owns the fixed overlay and scroll lock.' },
    {
      do: true,
      text: "Pass `closedBy='closerequest'` when the dialog holds input or confirms a destructive action, so a stray outside press does not discard it.",
    },
    {
      do: true,
      text: 'Style a stack with `data-stacked` and `data-stack-base`, not `data-nested`, which any floating ancestor such as a menu sets.',
    },
    {
      do: true,
      text: 'Type a payload through the handle, `Dialog.createHandle<Payload>()`. It is captured at open, so for data that changes while open pass an id and read live state.',
    },
    {
      do: true,
      text: "For an inline dialog, pass `overlay={false}` on the viewport, `modal={false}` and `closedBy='none'` on the root, and `initialFocus={false}` on the popup.",
    },
    {
      do: false,
      text: "Use `closedBy='none'` unless the user must finish or acknowledge. It removes the Escape exit.",
    },
  ],
  parts: {
    'Dialog.Root': {
      description: 'Holds the open state, the active trigger and its payload. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Whether the dialog is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the dialog is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: {
          type: '(open: boolean, details: DialogOpenChangeDetails) => void',
          doc: 'Called with the new open state and `details` naming the trigger and event behind it.',
        },
        modal: { type: 'boolean', doc: 'Traps focus and blocks the rest of the page.', default: 'true' },
        closedBy: {
          type: 'DialogClosedBy',
          doc: '`any` closes on Escape and outside press, `closerequest` on Escape only, `none` only programmatically.',
          default: "'any'",
        },
        role: { type: 'DialogRole', doc: '`dialog` or `alertdialog` for the popup.', default: "'dialog'" },
        handle: {
          type: 'DialogHandle<Payload>',
          doc: 'Connects triggers rendered outside the root. From `Dialog.createHandle()`.',
        },
        triggerId: {
          type: 'string | null',
          doc: 'The trigger the open is attributed to, when controlled. Focus returns to it on close.',
        },
        children: {
          type: 'ReactNode | ((ctx: { payload: Payload | undefined }) => ReactNode)',
          doc: 'Content, or a function of `{ payload }` from the active trigger or `handle.open(payload)`.',
        },
      },
    },
    'Dialog.Trigger': {
      description:
        'A `button` that toggles the dialog and gets focus back on close. Carries `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` while open, and `data-open` or `data-closed`.',
      props: {
        handle: { type: 'DialogHandle<Payload>', doc: 'Drives a root rendered elsewhere. Not needed inside a root.' },
        id: { type: 'string', doc: "Names the trigger for the root's `triggerId`.", default: 'a generated id' },
        payload: { type: 'Payload', doc: "Data the root's children function receives when this trigger opens it." },
      },
    },
    'Dialog.Portal': {
      description: 'Portals its children while the dialog is mounted.',
      props: {
        root: {
          type: 'HTMLElement | null | React.RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `PortalProvider` container, else `document.body`',
        },
      },
    },
    'Dialog.Backdrop': {
      description: 'A `div` behind the popup. Carries `data-open` or `data-closed`, `data-nested` and `data-stacked`.',
    },
    'Dialog.Viewport': {
      description:
        'A fixed `div` that centers the popup and locks scroll. Carries `data-open` or `data-closed`, and `data-nested`.',
      props: {
        lockScroll: { type: 'boolean', doc: 'Locks body scroll while open.', default: 'true' },
        overlay: {
          type: 'boolean',
          doc: 'Set `false` to render in flow, with no fixed overlay and no scroll lock.',
          default: 'true',
        },
      },
    },
    'Dialog.Popup': {
      description:
        'The dialog `div`, with its role and ARIA wiring, inside the focus manager. Carries `data-nested`, `data-stacked` and `data-stack-base`. Its children freeze at their last frame while it exits.',
      props: {
        initialFocus: {
          type: 'DialogFocusTarget',
          doc: 'Where focus goes on open: `true`, `false`, a ref, or a function of the interaction type.',
          default: 'the first tabbable element',
        },
        finalFocus: {
          type: 'DialogFocusTarget',
          doc: 'Where focus goes on close, in the same forms as `initialFocus`.',
          default: 'the trigger, unless a pointer closed it',
        },
      },
    },
    'Dialog.Title': { description: 'An `h2` that names the popup through `aria-labelledby`.' },
    'Dialog.Description': { description: 'A `p` that describes the popup through `aria-describedby`.' },
    'Dialog.Close': { description: 'A `button` that closes the dialog.' },
  },
  examples: [
    {
      title: 'A modal',
      code: `
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Viewport>
      <Dialog.Popup>
        <Dialog.Title>Confirm</Dialog.Title>
        <Dialog.Close>Cancel</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>
`,
    },
    {
      title: 'A detached trigger with a payload',
      code: `
const detail = Dialog.createHandle<{ name: string }>();

<Dialog.Trigger handle={detail} payload={{ name: 'Alice' }}>Alice</Dialog.Trigger>
<Dialog.Root handle={detail}>
  {({ payload }) => (
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Viewport>
        <Dialog.Popup>{payload?.name}</Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  )}
</Dialog.Root>
`,
    },
  ],
  related: ['Drawer', 'Popover'],
} satisfies ComponentDoc<{
  'Dialog.Root': DialogProps;
  'Dialog.Trigger': DialogTriggerProps;
  'Dialog.Portal': DialogPortalProps;
  'Dialog.Backdrop': DialogBackdropProps;
  'Dialog.Viewport': DialogViewportProps;
  'Dialog.Popup': DialogPopupProps;
  'Dialog.Title': DialogTitleProps;
  'Dialog.Description': DialogDescriptionProps;
  'Dialog.Close': DialogCloseProps;
}>;
