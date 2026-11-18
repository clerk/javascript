import type { ComponentDoc } from '../../docs-schema';
import type { InputProps } from '../input';
import type { InputGroupAddonProps, InputGroupRootProps } from './input-group';

export default {
  name: 'InputGroup',
  description:
    'Draws one field chrome around an `Input` and addons on either side, such as an icon, a prefix or a button. A click on a bare part of the group focuses the input.',
  useFor: ['an input with a leading icon or prefix', 'an input with a trailing button, such as show password or clear'],
  keywords: ['input group', 'addon', 'prefix', 'suffix', 'adornment', 'input button'],
  practices: [
    { do: true, text: 'Use `InputGroup.Input`, so the input takes the group size and drops its own chrome.' },
    {
      do: true,
      text: 'Put a `Button` in an addon without size or variant props. The addon sizes it as a square neutral ghost button to fit the group.',
    },
    { do: false, text: 'Render `InputGroup.Start` or `InputGroup.End` outside `InputGroup.Root`. They throw.' },
  ],
  parts: {
    'InputGroup.Root': {
      description: 'A `div` that draws the chrome and carries `data-size`, `data-disabled` and `data-invalid`.',
      slot: 'cl-input-group',
      props: {
        size: {
          type: 'InputGroupSize',
          doc: '`sm`, `md` or `lg`. The input and addon buttons follow it.',
          default: "'md'",
        },
        disabled: {
          type: 'boolean',
          doc: 'Disables the input and addon buttons.',
          default: "the enclosing `Field`'s, else `false`",
        },
        invalid: {
          type: 'boolean',
          doc: 'Marks the input `aria-invalid`.',
          default: "the enclosing `Field`'s, else `false`",
        },
      },
    },
    'InputGroup.Input': {
      description: 'The `Input`, as a `ghost` input sized by the group.',
      slot: 'cl-input',
    },
    'InputGroup.Start': {
      description: 'A `span` before the input. Sets the defaults for any `Button` inside it.',
      slot: 'cl-input-group-start',
    },
    'InputGroup.End': {
      description: 'A `span` after the input. Sets the defaults for any `Button` inside it.',
      slot: 'cl-input-group-end',
    },
  },
  examples: [
    {
      title: 'A search input',
      code: `
<InputGroup.Root>
  <InputGroup.Start>
    <Icon glyph={MagnifyingGlass} />
  </InputGroup.Start>
  <InputGroup.Input type='search' aria-label='Search' />
</InputGroup.Root>
`,
    },
  ],
  related: ['Input', 'PasswordInput', 'PhoneInput', 'Field'],
} satisfies ComponentDoc<{
  'InputGroup.Root': InputGroupRootProps;
  'InputGroup.Input': InputProps;
  'InputGroup.Start': InputGroupAddonProps;
  'InputGroup.End': InputGroupAddonProps;
}>;
