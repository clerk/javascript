import type { ComponentDoc } from '../../docs-schema';
import type {
  DialogCloseButtonProps,
  DialogCloseProps,
  DialogPopupProps,
  DialogRootProps,
  DialogTriggerProps,
} from './dialog';

export default {
  name: 'Dialog',
  description:
    'A modal surface over the page. The popup holds a `Card` or a `Profile`, and owns focus, scroll lock and the backdrop.',
  useFor: [
    'a modal over the page',
    'a dialog opened from a trigger elsewhere in the tree, with `createHandle`',
    'an alert that needs an answer',
  ],
  keywords: ['dialog', 'modal', 'alertdialog', 'overlay', 'sheet', 'popup'],
  practices: [
    { do: true, text: 'Put a `Card.Root` in `Dialog.Popup`, with `Card.Title` to name the dialog.' },
    {
      do: true,
      text: "Use `role='alertdialog'` for a question the user must answer. It never closes on an outside press.",
    },
    { do: true, text: 'Pass `shouldCloseOnInteractOutside={false}` when an accidental press would throw work away.' },
    {
      do: false,
      text: 'Build a confirm dialog by hand. Use `useConfirmController` with `Confirmation` or `Destructive`.',
    },
  ],
  parts: {
    'Dialog.Root': {
      description: 'Owns the open state, the role and how the dialog dismisses. Escape always closes.',
      props: {
        role: {
          type: "'dialog' | 'alertdialog'",
          doc: '`dialog`, or `alertdialog` for an interruption that needs an answer.',
          default: "'dialog'",
        },
        shouldCloseOnInteractOutside: {
          type: 'boolean',
          doc: 'Whether an outside press closes the dialog. Always `false` for `alertdialog`.',
          default: "true for 'dialog', false for 'alertdialog'",
        },
        showCloseButton: {
          type: 'boolean',
          doc: 'Whether the surface renders its dismiss.',
          default: "true for 'dialog', false for 'alertdialog'",
        },
      },
    },
    'Dialog.Trigger': {
      description: 'Opens the dialog.',
      props: {
        handle: {
          type: 'DialogHandle<Payload>',
          doc: 'Connects a trigger to a root rendered elsewhere. Create with `Dialog.createHandle()`.',
        },
        payload: { type: 'Payload', doc: "Delivered to the root's children-as-function as `{ payload }`." },
      },
    },
    'Dialog.Popup': {
      description: 'Renders the backdrop, viewport and popup.',
      slot: 'cl-dialog-popup',
      props: {
        variant: {
          type: "'card' | 'profile' | 'fullscreen'",
          doc: '`card` for a `Card`, `profile` for a `Profile` at full height, `fullscreen` for a `Profile` filling the viewport.',
          default: "'card'",
        },
        compactPlacement: {
          type: "'sheet' | 'center'",
          doc: 'Under `40rem`, `sheet` anchors to the bottom edge and `center` keeps it centered. `card` only.',
          default: "'sheet'",
        },
        initialFocus: {
          type: 'DialogFocusTarget',
          doc: 'Where focus moves on open.',
          default: 'the first tabbable element',
        },
        finalFocus: { type: 'DialogFocusTarget', doc: 'Where focus returns on close.', default: 'the trigger' },
      },
    },
    'Dialog.Close': { description: 'A button that closes the dialog.' },
    'Dialog.CloseButton': {
      description: 'The icon dismiss button.',
      slot: 'cl-dialog-close-button',
      props: { 'aria-label': { type: 'string', doc: 'Names the button. Pass a localized string.' } },
    },
  },
  examples: [
    {
      title: 'A controlled dialog',
      code: `
<Dialog.Root open={open} onOpenChange={onOpenChange}>
  <Dialog.Popup>
    <Card.Root elevation='overlay'>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
      </Card.Header>
    </Card.Root>
  </Dialog.Popup>
</Dialog.Root>
`,
    },
  ],
  related: ['Card', 'useConfirmController', 'Drawer'],
} satisfies ComponentDoc<{
  'Dialog.Root': DialogRootProps;
  'Dialog.Trigger': DialogTriggerProps;
  'Dialog.Popup': DialogPopupProps;
  'Dialog.Close': DialogCloseProps;
  'Dialog.CloseButton': DialogCloseButtonProps;
}>;
