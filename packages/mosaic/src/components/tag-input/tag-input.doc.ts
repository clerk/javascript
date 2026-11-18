import type { ComponentDoc } from '../../docs-schema';
import type { TagInputProps } from './tag-input';

export default {
  name: 'TagInput',
  description:
    'A field that turns typed and pasted entries into removable tags. A delimiter, Enter or blur commits the draft; entries are trimmed and duplicates dropped. Backspace or the reading-direction arrow at the start of the input moves to the last tag, and Backspace or Delete on a tag removes it. The ref and other props go to the text input (`cl-tag-input-input`). Inside a `Field` it takes the field id, label, disabled, required, invalid and message wiring.',
  useFor: [
    'entering several email addresses, such as invitations',
    'a list of free-text values, such as domains or keywords',
    'pasting a comma-separated list',
  ],
  keywords: ['tag input', 'tags', 'chips', 'multi value', 'emails', 'token input'],
  practices: [
    { do: true, text: 'Pass a localized `removeLabel`. The default is English.' },
    {
      do: true,
      text: 'Pass `validate` to mark bad entries invalid instead of dropping them, and show a `Field.Error`.',
    },
    { do: true, text: 'Pass `name` to submit each tag as a hidden input in a native form.' },
  ],
  parts: {
    TagInput: {
      description:
        'Renders a `div` with the tags (`cl-tag-input-list`) and the input. Each tag is a `cl-tag-input-tag` with a label (`cl-tag-input-tag-label`) and remove button (`cl-tag-input-tag-remove`), carrying `data-invalid` and `data-disabled`. The root carries `data-disabled` and `data-invalid`.',
      slot: 'cl-tag-input',
      props: {
        value: { type: 'string[]', doc: 'The tags, when controlled.' },
        defaultValue: { type: 'string[]', doc: 'The tags on mount.', default: '[]' },
        onValueChange: { type: '(value: string[]) => void', doc: 'Called with the new tags.' },
        inputValue: { type: 'string', doc: 'The uncommitted draft, when controlled.' },
        defaultInputValue: { type: 'string', doc: 'The draft on mount.', default: "''" },
        onInputValueChange: { type: '(inputValue: string) => void', doc: 'Called with the new draft.' },
        validate: {
          type: '(value: string) => boolean',
          doc: 'Returns `false` to mark a tag invalid. Invalid tags stay in `value`.',
        },
        delimiters: {
          type: 'string[]',
          doc: 'Characters that commit the draft as you type or paste.',
          default: "[',']",
        },
        name: { type: 'string', doc: 'Renders one hidden input per tag with this name.' },
        removeLabel: {
          type: '(value: string) => string',
          doc: "Each remove button's accessible name.",
          default: '`Remove ${value}`',
        },
        required: { type: 'boolean', doc: 'Required while there are no tags.' },
      },
    },
  },
  examples: [
    {
      title: 'Email invitations',
      code: `
<Field.Root>
  <Field.Label>{m.emailLabel}</Field.Label>
  <TagInput
    name='emailAddresses'
    delimiters={[',', ' ']}
    value={emails}
    onValueChange={setEmails}
    validate={isValidEmail}
    removeLabel={email => fill(m.removeEmail, { email })}
  />
</Field.Root>
`,
    },
  ],
  related: ['Field', 'Input'],
} satisfies ComponentDoc<{ TagInput: TagInputProps }>;
