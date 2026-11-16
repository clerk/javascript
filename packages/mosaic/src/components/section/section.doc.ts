import type { ComponentDoc } from '../../docs-schema';
import type {
  SectionActionsProps,
  SectionBodyProps,
  SectionContentProps,
  SectionDescriptionProps,
  SectionErrorProps,
  SectionGroupProps,
  SectionHeaderProps,
  SectionItemProps,
  SectionItemsProps,
  SectionLabelProps,
  SectionMediaProps,
  SectionNoteProps,
  SectionRootProps,
  SectionRowProps,
  SectionTitleProps,
} from './section';

export default {
  name: 'Section',
  description:
    'A compound layout for a topic of settings. `Section.Root` stacks groups; each `Section.Group` is named by the `Section.Title` in its `Section.Header`, above a `Section.Body` card holding `Section.Row`s (one setting each) or a `Section.Items` list of values. The root is a `cl-section` size container that switches to a compact layout below 26rem; `sectionCompactStyles.hidden` and `.only` show or hide content at that width.',
  useFor: [
    'a settings page or profile section with rows of settings',
    'a row with a label, a value and an action, such as an Edit button',
    'a list of values, such as emails or devices, inside a settings card',
    'a row-level error message for a row without a form control',
  ],
  keywords: ['section', 'settings', 'row', 'profile', 'card', 'list', 'item'],
  practices: [
    {
      do: true,
      text: 'Render `<Section.Error>{error}</Section.Error>` without a conditional. It opens and closes on its message.',
    },
    {
      do: true,
      text: 'Place `Section.Error` beside `Section.Item` inside `Section.Row`, not inside `Section.Content`.',
    },
    { do: true, text: 'Use `Section.Note` in place of `Section.Actions` when a row offers no action, to say why.' },
    { do: false, text: 'Wrap `Section.Note` in `Section.Actions`. It holds its own trailing position.' },
    {
      do: false,
      text: 'Swap rows for a loading state with a conditional in the view. Build a skeleton with `Skeleton` (`mosaic guides inspect skeletons`).',
    },
  ],
  parts: {
    'Section.Root': { description: 'Renders a `section` that stacks groups.', slot: 'cl-section' },
    'Section.Group': {
      description:
        "A `role='group'` labelled by its `Section.Title`, unless `aria-label` or `aria-labelledby` is passed.",
      slot: 'cl-section-group',
    },
    'Section.Header': {
      description: 'Holds the title, and optionally `Section.Content` and `Section.Actions` laid out for a header.',
      slot: 'cl-section-header',
    },
    'Section.Title': {
      description:
        'A `Heading` at the current heading level, at size `base`, truncated to one line. Generates an `id` inside a group so the group is named by it. Takes `Heading` props except `size`.',
      slot: 'cl-section-title',
    },
    'Section.Body': { description: 'The card that holds rows or an items list.', slot: 'cl-section-body' },
    'Section.Row': { description: 'One setting.', slot: 'cl-section-row' },
    'Section.Items': {
      description: 'A `ul` of values. Each `Section.Item` inside renders as an `li` and carries `data-nested`.',
      slot: 'cl-section-items',
    },
    'Section.Item': {
      description:
        'Lays out media, content and actions on one line. Renders a `div`, or an `li` inside `Section.Items`.',
      slot: 'cl-section-item',
      props: {
        wrap: {
          type: 'boolean',
          doc: 'Lets the actions wrap under the content. Carries `data-wrap`.',
          default: 'false',
        },
      },
    },
    'Section.Media': {
      description: 'A leading box for an avatar, logo or icon. Carries `data-size`.',
      slot: 'cl-section-media',
      props: { size: { type: 'SectionMediaSize', doc: '`sm`, `md`, `lg` or `xl`.', default: "'md'" } },
    },
    'Section.Content': {
      description: 'Stacks the label and description. Carries `data-nested` inside `Section.Items`.',
      slot: 'cl-section-content',
    },
    'Section.Label': {
      description: 'The row label. Its text truncates to one line; element children such as icons pass through.',
      slot: 'cl-section-label',
    },
    'Section.Description': { description: 'Secondary text under the label.', slot: 'cl-section-description' },
    'Section.Actions': { description: 'Trailing buttons or menu for the row.', slot: 'cl-section-actions' },
    'Section.Note': {
      description: 'Static text in place of an action, stating why the row offers none. Truncated to one line.',
      slot: 'cl-section-note',
      props: {
        icon: {
          type: 'React.ReactNode',
          doc: 'Renders in a leading slot (`cl-section-note-icon`) sized to the text, such as a lock.',
        },
      },
    },
    'Section.Error': {
      description:
        "A row-level message with `role='alert'`, for a row that holds no form control. Animates its height open and closed.",
      slot: 'cl-section-error',
    },
  },
  examples: [
    {
      title: 'A settings row',
      code: `
<Section.Row>
  <Section.Item>
    <Section.Content>
      <Section.Label>{m.name.label}</Section.Label>
      <Section.Description>{name}</Section.Description>
    </Section.Content>
    <Section.Actions>{editButton}</Section.Actions>
  </Section.Item>
  <Section.Error>{error}</Section.Error>
</Section.Row>
`,
    },
  ],
  related: ['Heading', 'Skeleton', 'Field'],
} satisfies ComponentDoc<{
  'Section.Root': SectionRootProps;
  'Section.Group': SectionGroupProps;
  'Section.Header': SectionHeaderProps;
  'Section.Title': SectionTitleProps;
  'Section.Body': SectionBodyProps;
  'Section.Row': SectionRowProps;
  'Section.Items': SectionItemsProps;
  'Section.Item': SectionItemProps;
  'Section.Media': SectionMediaProps;
  'Section.Content': SectionContentProps;
  'Section.Label': SectionLabelProps;
  'Section.Description': SectionDescriptionProps;
  'Section.Actions': SectionActionsProps;
  'Section.Note': SectionNoteProps;
  'Section.Error': SectionErrorProps;
}>;
