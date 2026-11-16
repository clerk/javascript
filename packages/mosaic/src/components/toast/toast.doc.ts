import type { HookDoc } from '../../docs-schema';
import type { ToastManager } from './use-toast-manager';

export default {
  name: 'useToastManager',
  description:
    'Adds, updates and closes toasts in the nearest toast provider, which `MosaicProvider` and profile dialogs mount. A toast is a stacked card in the viewport (`cl-toast-root`), or a small label next to an element when `positionerProps.anchor` is set. `type` of `success`, `error` or `loading` shows an icon or spinner. Toasts close after 5 seconds and at most 3 stack.',
  useFor: [
    'a confirmation after an action succeeds, such as invitations sent',
    'a message that tracks a promise from loading to success or error',
    'a short label next to a button, such as Copied',
  ],
  keywords: ['toast', 'notification', 'snackbar', 'flash message', 'success message', 'copied'],
  practices: [
    { do: true, text: 'Call it in the controller and add the toast when the action resolves.' },
    { do: true, text: 'Pass the same `id` to `add` to refresh an open toast instead of stacking a copy.' },
    {
      do: false,
      text: 'Show an error that belongs on a form or row in a toast. Use the owners in "Reuse before you write" instead.',
    },
  ],
  returns: {
    toasts: { type: 'ToastObject[]', doc: 'The current toasts, newest first.' },
    add: {
      type: '(options: ToastOptions) => string',
      doc: 'Shows a toast from `{ label, description, type, timeout, priority, id, positionerProps }` and returns its id. `timeout: 0` keeps it until closed.',
    },
    close: { type: '(id?: string) => void', doc: 'Closes the toast with this id, or every toast without one.' },
    update: {
      type: '(id: string, options: ToastUpdateOptions | ((toast: ToastObject) => ToastUpdateOptions)) => void',
      doc: 'Merges new options into a toast, or a function of the current toast.',
    },
    promise: {
      type: '<Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>',
      doc: 'Shows `loading` until the promise settles, then `success` or `error`, each a label, options or a function of the result. Returns the promise.',
    },
  },
  examples: [
    {
      title: 'After an action',
      code: `
const toast = useToastManager();
toast.add({ type: 'success', label: m.sent });
`,
    },
    {
      title: 'Track a promise',
      code: `
await toast.promise(save(), { loading: m.saving, success: m.saved, error: m.failed });
`,
    },
  ],
  related: ['CopyButton', 'MosaicProvider'],
} satisfies HookDoc<object, ToastManager>;
