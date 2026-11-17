import type { ComponentDoc } from '../../docs-schema';
import type { CopyButtonProps } from './copy-button';

export default {
  name: 'CopyButton',
  description:
    'An icon `Button` that copies `value` to the clipboard and confirms with a short "Copied" toast beside it. Takes every `Button` prop but `children`.',
  useFor: ['copying an id, key, secret or URL to the clipboard', 'a copy icon next to a value'],
  keywords: ['copy', 'clipboard', 'copy button', 'copy to clipboard', 'api key', 'secret'],
  practices: [
    { do: true, text: 'Pass localized `label` and `copiedLabel`.' },
    { do: true, text: 'Pass `onCopyError` to tell the user when the clipboard is blocked. Nothing shows otherwise.' },
    { do: false, text: 'Call `preventDefault` in `onClick` unless you mean to skip the copy.' },
  ],
  parts: {
    CopyButton: {
      description:
        'A `type="button"` icon button. The toast carries `cl-copy-button-toast` and its title `cl-copy-button-toast-title`.',
      slot: 'cl-button',
      props: {
        value: { type: 'string', doc: 'The text to copy.' },
        label: { type: 'string', doc: 'Accessible name of the button.', default: "'Copy'" },
        copiedLabel: { type: 'string', doc: 'The toast text after a copy.', default: "'Copied'" },
        side: { type: 'ToastSide', doc: 'Side of the button the toast shows on.', default: "'top'" },
        resetAfter: { type: 'number', doc: 'How long the toast stays, in ms.', default: '2000' },
        onCopy: {
          type: '(value: string) => void | Promise<void>',
          doc: 'Replaces the clipboard write. Reject to show no toast.',
        },
        onCopyError: { type: '(error: unknown) => void', doc: 'Called when the copy fails.' },
        color: { type: "'primary' | 'neutral' | 'negative'", doc: 'The `Button` color.', default: "'neutral'" },
        variant: { type: "'filled' | 'outline' | 'ghost' | 'link'", doc: 'The `Button` variant.', default: "'ghost'" },
        size: { type: "'xs' | 'sm' | 'md' | 'lg'", doc: 'The `Button` size.', default: "'xs'" },
        shape: { type: "'default' | 'square' | 'circle'", doc: 'The `Button` shape.', default: "'square'" },
      },
    },
  },
  examples: [
    {
      title: 'Copy an id',
      code: `
<CopyButton value={user.id} label={m.copyId} copiedLabel={m.copied} />
`,
    },
  ],
  related: ['Button'],
} satisfies ComponentDoc<{ CopyButton: CopyButtonProps }>;
