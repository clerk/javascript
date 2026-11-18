import type { HookDoc } from '../docs-schema';
import type { PendingAction, PendingActionOptions } from './use-pending-action';

export default {
  name: 'usePendingAction',
  description:
    'Runs inline actions, such as row buttons, under one lock. Tracks which key is pending, which ran last, and which last failed.',
  useFor: [
    'an async action from a button or row',
    'pending state and an error for a list of row actions',
    'one lock so a second click is ignored while an action runs',
  ],
  keywords: ['pending', 'loading', 'busy', 'lock', 'row action', 'error'],
  practices: [
    { do: true, text: 'Derive disabled state from `isPending` instead of mirroring it in `useState`.' },
    {
      do: true,
      text: 'Pass a stable key per row, such as the resource id, and compare it to `pendingKey` and `errorKey`.',
    },
    { do: false, text: 'Wrap `run` in `try`/`catch`. It resolves `false` on failure and owns the error copy.' },
    {
      do: false,
      text: 'Use it for a form submit or a confirm dialog. Use `useForm` or `useConfirmController` instead.',
    },
  ],
  options: {
    errorFallback: {
      type: 'string',
      doc: 'Copy shown when the action fails without an error Clerk can describe, such as a network fault.',
      default: 'the generic error',
    },
  },
  returns: {
    run: {
      type: '(key: string, action: () => void | Promise<unknown>, options?: PendingActionOptions) => Promise<boolean>',
      doc: 'Runs `action` under `key`. Resolves `true` on success and `false` on failure. Ignored while any run is in flight. Clears the last error when it starts. A cancelled reverification is not an error.',
    },
    pendingKey: { type: 'string', doc: 'The key that is running, if any.' },
    lastKey: { type: 'string', doc: 'The key that ran last, pending or not.' },
    isPending: { type: 'boolean', doc: 'Whether any run is in flight.' },
    error: { type: 'string', doc: 'Localized copy for the last failure.' },
    errorKey: { type: 'string', doc: 'The key that last failed.' },
    reset: { type: '() => void', doc: 'Clears the last error.' },
  },
  examples: [
    {
      title: 'Row actions in a controller',
      code: `
const actions = usePendingAction();

onSetPrimary: id => void actions.run(id, () => onSetPrimaryEmail(id)),
isDisabled: actions.isPending,
`,
    },
  ],
  related: ['useConfirmController', 'useForm', 'useListRemovalFocus'],
} satisfies HookDoc<PendingActionOptions, PendingAction<string>>;
