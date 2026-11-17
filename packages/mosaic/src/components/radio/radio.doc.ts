import type { ComponentDoc } from '../../docs-schema';
import type { MosaicComponentProps } from '../../props';
import type { ItemLabelProps } from '../item/item';
import type { RadioCardProps, RadioGroupProps, RadioItemProps, RadioSectionProps } from './radio';

export default {
  name: 'Radio',
  description:
    'A set of choices where one is picked. `Radio.Group` holds the value, typed from what you pass. Each choice is a bare `Radio.Item`, or a `Radio.Card` laid out as an `Item` row with media, a label and a description.',
  useFor: [
    'picking one option from a short list',
    'a choice shown as selectable cards, such as a plan or a provider',
    'grouping choices under headings, with `Radio.Section`',
  ],
  keywords: ['radio', 'radio group', 'choice', 'option', 'radio card', 'single select'],
  practices: [
    {
      do: true,
      text: 'Pass `name` to `Radio.Group` when it sits in a `<form>`. Without one the radios do not submit.',
    },
    { do: true, text: 'Give every `Radio.Item` and `Radio.Card` a `value`, so the group can tell it is checked.' },
    { do: true, text: 'Label a bare `Radio.Item` with a `Field`; a `Radio.Card` is labelled by its `Radio.Label`.' },
    { do: false, text: 'Use it for a long list of options. Use `Select` instead.' },
  ],
  parts: {
    'Radio.Group': {
      description: 'A `div` with `role="radiogroup"` that holds the value and name for every radio inside it.',
      slot: 'cl-radio-group',
      props: {
        value: { type: 'Value', doc: 'The picked value, when controlled. Any type; compared with `Object.is`.' },
        defaultValue: { type: 'Value', doc: 'The picked value on mount, when uncontrolled.' },
        onValueChange: { type: '(value: Value) => void', doc: 'Called with the picked value.' },
        name: { type: 'string', doc: 'The form field name. Without it the radios are left out of form submission.' },
        disabled: { type: 'boolean', doc: 'Disables every radio.' },
        layout: {
          type: 'RadioLayout',
          doc: '`stack` gives each choice a row. `grid` fits as many columns of cards as fit.',
          default: "'stack'",
        },
      },
    },
    'Radio.Item': {
      description:
        'A native `input type="radio"` with a drawn indicator. The ref goes to the input. Inside a `Field` it takes its id, label and state from the field.',
      slot: 'cl-radio',
      props: {
        value: { type: 'unknown', doc: 'The value it picks. A non-string value is sent to the form as JSON.' },
        size: { type: "'sm' | 'md'", doc: '`sm` or `md`.', default: "'md'" },
      },
    },
    'Radio.Section': {
      description:
        'A titled set of choices inside a group, as a `fieldset`. Its radios still share the group value and arrow keys.',
      slot: 'cl-radio-section',
      props: {
        label: { type: 'React.ReactNode', doc: 'The section heading, rendered as its `legend`.' },
        layout: { type: 'RadioLayout', doc: '`stack` or `grid`, for the choices inside it.', default: "'stack'" },
      },
    },
    'Radio.Card': {
      description:
        'A choice laid out as an `Item` row: a `label` around a visually hidden radio, so a click anywhere picks it. Carries `data-checked` and `data-disabled`.',
      slot: 'cl-radio-card',
      props: {
        value: { type: 'unknown', doc: 'The value it picks.' },
        disabled: { type: 'boolean', doc: 'Disables this card.', default: 'false' },
      },
    },
    'Radio.Media': { description: '`Item.Media`, for the leading icon or image of a card.', slot: 'cl-item-media' },
    'Radio.Content': {
      description: '`Item.Content`, for the label and description of a card.',
      slot: 'cl-item-content',
    },
    'Radio.Label': { description: '`Item.Label`. Names the radio of its card.', slot: 'cl-item-label' },
    'Radio.Description': {
      description: '`Item.Description`. Describes the radio of its card.',
      slot: 'cl-item-description',
    },
  },
  examples: [
    {
      title: 'Cards in a group',
      code: `
<Radio.Group name='provider' value={provider} onValueChange={setProvider}>
  <Radio.Card value='okta'>
    <Radio.Content>
      <Radio.Label>Okta workforce</Radio.Label>
    </Radio.Content>
  </Radio.Card>
</Radio.Group>
`,
    },
  ],
  related: ['Item', 'Field', 'Select', 'Checkbox'],
} satisfies ComponentDoc<{
  'Radio.Group': RadioGroupProps;
  'Radio.Item': RadioItemProps;
  'Radio.Section': RadioSectionProps;
  'Radio.Card': RadioCardProps;
  'Radio.Media': MosaicComponentProps<'div'>;
  'Radio.Content': MosaicComponentProps<'div'>;
  'Radio.Label': ItemLabelProps;
  'Radio.Description': MosaicComponentProps<'div'>;
}>;
