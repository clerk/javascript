import type { HookDoc } from '../docs-schema';

export default {
  name: 'useAccessibleNameWarning',
  description:
    'Warns in development when an element with one of the given roles has no accessible name. Call it as `useAccessibleNameWarning(node, { part, roles, title })`. Does nothing in production or while `node` is `null`.',
  useFor: [
    'a dev warning when an overlay part renders a dialog without a title',
    'a dev warning when a page panel renders without its title',
    'checking that `aria-labelledby` points at an element with text',
  ],
  keywords: ['accessibility', 'a11y', 'dialog', 'aria-label', 'aria-labelledby', 'title', 'warning'],
  practices: [
    {
      do: true,
      text: 'Pass the part that supplies the name as `title`, such as `Card.Title` for a `Dialog`.',
    },
    {
      do: true,
      text: 'Pass `null` while the part is inactive, such as an unselected page, so only the shown part is checked.',
    },
    {
      do: true,
      text: 'Pass the mounted node, such as from a callback ref held in state, so the check runs once the element exists.',
    },
  ],
  returns: {},
  examples: [
    {
      title: 'In an overlay popup',
      code: `
useAccessibleNameWarning(node, { part: 'Popover.Popup', roles: ['dialog', 'alertdialog'], title: 'Popover.Title' });
`,
    },
  ],
  related: ['useAccessibleDescriptionWarning', 'Dialog', 'Popover', 'Profile'],
} satisfies HookDoc<undefined, object>;
