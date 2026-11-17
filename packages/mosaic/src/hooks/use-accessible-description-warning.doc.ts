import type { HookDoc } from '../docs-schema';

export default {
  name: 'useAccessibleDescriptionWarning',
  description:
    'Warns in development when an alert dialog has no accessible description. Call it as `useAccessibleDescriptionWarning(node, component, descriptionPart?)`. Does nothing in production or while `node` is `null`.',
  useFor: [
    'a dev warning when an alert dialog renders without a description',
    'checking that `aria-describedby` points at an element with text',
  ],
  keywords: ['accessibility', 'a11y', 'alertdialog', 'aria-describedby', 'description', 'warning'],
  practices: [
    {
      do: true,
      text: 'Pass `null` as `node` for an ordinary dialog. Only an alert dialog needs a description.',
    },
    {
      do: true,
      text: 'Pass `descriptionPart` when the description comes from a part other than `<component>.Description`, as `Dialog` does with `Card.Description`.',
    },
  ],
  returns: {},
  examples: [
    {
      title: 'Only for an alert dialog',
      code: `
useAccessibleDescriptionWarning(isAlert ? node : null, 'Dialog', 'Card.Description');
`,
    },
  ],
  related: ['useAccessibleNameWarning', 'Dialog'],
} satisfies HookDoc<undefined, object>;
