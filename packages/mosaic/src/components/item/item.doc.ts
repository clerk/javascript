import type { ComponentDoc } from '../../docs-schema';
import type { MosaicComponentProps } from '../../props';
import type { ItemLabelProps, ItemProps } from './item';

export default {
  name: 'Item',
  description:
    'A bordered row for lists of accounts, organizations and settings: media, a label and description, and trailing actions. Every part takes `render` and forwards its ref.',
  useFor: [
    'a row in a list of accounts, organizations or settings',
    'a clickable row that links or acts, with `render`',
    'a row with trailing buttons or a badge',
  ],
  keywords: ['item', 'row', 'list item', 'card row', 'account row', 'list'],
  practices: [
    {
      do: true,
      text: 'Pass `render` with a link or button to make the row interactive. Only then does it gain hover and a pointer cursor.',
    },
    {
      do: true,
      text: "Use `variant='interactive'` on `Item.Label` when the text is the action, such as `Sign out`, so it brightens with the row.",
    },
    { do: true, text: 'Stack rows in `Item.Group`.' },
    { do: false, text: 'Build a radio choice from `Item`. Use `Radio.Card` instead.' },
  ],
  parts: {
    'Item.Root': {
      description: 'The row. Renders a `div`, or the `render` element, which carries `data-interactive`.',
      slot: 'cl-item',
    },
    'Item.Media': {
      description: 'A square column that centers an icon, image, avatar or spinner.',
      slot: 'cl-item-media',
    },
    'Item.Content': {
      description: 'Stacks the label and description, and grows to fill the row.',
      slot: 'cl-item-content',
    },
    'Item.Label': {
      description: 'The row label, cut to one line. Inside a `Field` it labels the control.',
      slot: 'cl-item-label',
      props: {
        variant: {
          type: 'LabelVariant',
          doc: '`default` sets its own color for a subject the row names. `interactive` takes the row color, so it follows the row hover.',
          default: "'default'",
        },
      },
    },
    'Item.Description': {
      description: 'Secondary text below the label, cut to one line. Inside a `Field` it describes the control.',
      slot: 'cl-item-description',
    },
    'Item.Actions': {
      description: 'Trailing controls, such as buttons or badges.',
      slot: 'cl-item-actions',
    },
    'Item.Group': {
      description: 'A spaced vertical stack of rows. Layout only.',
      slot: 'cl-item-group',
    },
  },
  examples: [
    {
      title: 'A linked row',
      code: `
<Item.Root render={({ children, ...props }) => <a {...props} href='/org'>{children}</a>}>
  <Item.Media><Avatar.Root size='fit'>…</Avatar.Root></Item.Media>
  <Item.Content><Item.Label>Clerk</Item.Label></Item.Content>
</Item.Root>
`,
    },
  ],
  related: ['Radio', 'Avatar'],
} satisfies ComponentDoc<{
  'Item.Root': ItemProps;
  'Item.Media': MosaicComponentProps<'div'>;
  'Item.Content': MosaicComponentProps<'div'>;
  'Item.Label': ItemLabelProps;
  'Item.Description': MosaicComponentProps<'div'>;
  'Item.Actions': MosaicComponentProps<'div'>;
  'Item.Group': MosaicComponentProps<'div'>;
}>;
