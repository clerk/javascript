import type { ComponentDoc } from '../../docs-schema';
import type { ActionMenuProps } from './action-menu';

export default {
  name: 'ActionMenu',
  description:
    'A row\'s "more actions" menu built from a list of actions: an icon trigger that opens a `Menu` with one item per action. An action with a `status` keeps the menu open and shows a spinner while pending, then closes it.',
  useFor: [
    'a manage menu on a table row or list item',
    'a kebab menu of row actions such as revoke or remove',
    'a menu item that stays open with a spinner while its action runs',
  ],
  keywords: ['action menu', 'kebab', 'more actions', 'row menu', 'overflow menu', 'manage'],
  practices: [
    { do: true, text: 'Pass a `label` that names the row, such as "Manage jane@example.com".' },
    {
      do: true,
      text: 'Set `status` on an action whose work runs inside the menu. Leave it unset for an action that opens a dialog, so the menu closes on click.',
    },
    {
      do: true,
      text: 'Pass `triggerRef` from `useListRemovalFocus` when the action can remove the row.',
    },
    { do: false, text: 'Give two actions the same `label`. It is the item key.' },
  ],
  parts: {
    ActionMenu: {
      description:
        'Renders nothing when `actions` is empty. While any action is pending, every item is disabled and the menu ignores close requests.',
      props: {
        label: { type: 'string', doc: 'Accessible name for the icon trigger.' },
        actions: {
          type: 'ActionMenuAction[]',
          doc: 'One item per action: `label`, `onClick`, and optional `color` (`neutral` or `negative`), `icon` and `status` (`idle` or `pending`).',
        },
        triggerRef: { type: 'Ref<HTMLButtonElement>', doc: 'Ref to the trigger button, to restore focus to it.' },
        disabled: { type: 'boolean', doc: 'Disables the trigger and every item.' },
        focusableWhenDisabled: { type: 'boolean', doc: 'Keeps the trigger in the tab order while `disabled`.' },
      },
    },
  },
  examples: [
    {
      title: 'Revoke from a row',
      code: `
<ActionMenu
  label={fill(m.manage, { name: invitation.email })}
  triggerRef={registerTrigger(invitation.id)}
  actions={[{ label: m.revoke, color: 'negative', onClick: () => onRevokeClick(invitation) }]}
/>
`,
    },
  ],
  related: ['Menu', 'useListRemovalFocus', 'useConfirmController'],
} satisfies ComponentDoc<{ ActionMenu: ActionMenuProps }>;
