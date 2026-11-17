import type { HookDoc } from '../docs-schema';

export default {
  name: 'useAccessibleNameWarning',
  description:
    'Warns in development when an element with `role="dialog"` or `role="alertdialog"` has no accessible name. Call it as `useAccessibleNameWarning(node, component, titlePart?)`. Does nothing in production.',
  useFor: [
    'a dev warning when an overlay part renders a dialog without a title',
    'checking that `aria-labelledby` points at an element with text',
  ],
  keywords: ['accessibility', 'a11y', 'dialog', 'aria-label', 'aria-labelledby', 'title', 'warning'],
  practices: [
    {
      do: true,
      text: 'Pass `titlePart` when the name comes from a part other than `<component>.Title`, as `Dialog` does with `Card.Title`.',
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
useAccessibleNameWarning(node, 'Popover');
`,
    },
  ],
  related: ['useAccessibleDescriptionWarning', 'Dialog', 'Popover'],
} satisfies HookDoc<undefined, object>;
