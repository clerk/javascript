import type { ComponentDoc } from '../../docs-schema';
import type {
  TagInputInputProps,
  TagInputListProps,
  TagInputProps,
  TagInputTagProps,
  TagInputTagRemoveProps,
} from './parts';

export default {
  name: 'TagInput',
  description:
    'Headless, unstyled text input that turns entries into a list of string tags. Enter, a delimiter, paste or blur adds the trimmed text; blanks and duplicates are dropped. Backspace or the reading-start arrow at the start of the input moves into the tags. `TagInput.useTagInput()` reads the tags from inside the root.',
  useFor: [
    'entering several email addresses or domains in one field',
    'a list of free-text tags or keywords',
    'pasting a comma-separated list that splits into items',
  ],
  keywords: ['tag input', 'tags', 'chips', 'tokens', 'multi value', 'email list', 'domains'],
  practices: [
    {
      do: true,
      text: 'Render tags from `useTagInput().tags`, not `value`. It keeps removed tags until their exit animation ends.',
    },
    { do: true, text: 'Pass `validate` to flag bad entries. A failing tag is kept and carries `data-invalid`.' },
    { do: true, text: 'Pass `name` to submit the tags with a form. Each tag becomes a hidden input.' },
    { do: false, text: 'Render `TagInput.TagRemove` outside a `TagInput.Tag`. It throws.' },
  ],
  parts: {
    'TagInput.Root': {
      description:
        'A `div` that holds the tags and the draft text, and focuses the input when its empty space is pressed. Carries `data-disabled` and `data-empty`.',
      props: {
        value: { type: 'string[]', doc: 'The tags, when controlled.' },
        defaultValue: { type: 'string[]', doc: 'The tags on mount, when uncontrolled.', default: '[]' },
        onValueChange: { type: '(value: string[]) => void', doc: 'Called with the new tags.' },
        inputValue: { type: 'string', doc: 'The draft text, when controlled.' },
        defaultInputValue: { type: 'string', doc: 'The draft text on mount, when uncontrolled.', default: "''" },
        onInputValueChange: { type: '(inputValue: string) => void', doc: 'Called with the new draft text.' },
        validate: {
          type: '(value: string) => boolean',
          doc: 'Returns `false` to mark a tag invalid. Does not block adding it.',
        },
        delimiters: {
          type: 'string[]',
          doc: 'Strings that split typed or pasted text into tags. Newlines and tabs always split.',
          default: "[',']",
        },
        name: { type: 'string', doc: 'Submits each tag as a hidden input with this name.' },
        form: { type: 'string', doc: 'The `id` of the form the hidden inputs belong to.' },
        disabled: { type: 'boolean', doc: 'Blocks adding and removing tags.', default: 'false' },
        focusableWhenDisabled: {
          type: 'boolean',
          doc: 'Keeps the input focusable and read-only while disabled.',
          default: 'false',
        },
      },
    },
    'TagInput.List': { description: 'A `div` with `role="list"` that holds the tags.' },
    'TagInput.Tag': {
      description:
        'A `div` with `role="listitem"`, reached with arrow keys. Backspace or Delete removes it. Carries `data-value`, `data-invalid`, `data-disabled` and the transition attributes, and renders nothing once it has exited.',
      props: { value: { type: 'string', doc: 'The tag this element shows.' } },
    },
    'TagInput.TagRemove': {
      description: 'A `button` labelled `Remove <value>` that removes its tag, out of the tab order.',
    },
    'TagInput.Input': {
      description: 'The text `input` for the draft. Its value is owned by the root.',
    },
  },
  examples: [
    {
      title: 'Email list',
      code: `
function Tags() {
  const { tags } = TagInput.useTagInput();
  return (
    <TagInput.List>
      {tags.map(tag => (
        <TagInput.Tag key={tag.value} value={tag.value}>
          {tag.value}
          <TagInput.TagRemove />
        </TagInput.Tag>
      ))}
    </TagInput.List>
  );
}

<TagInput.Root name='emails' validate={isEmail}>
  <Tags />
  <TagInput.Input aria-label='Emails' />
</TagInput.Root>
`,
    },
  ],
} satisfies ComponentDoc<{
  'TagInput.Root': TagInputProps;
  'TagInput.List': TagInputListProps;
  'TagInput.Tag': TagInputTagProps;
  'TagInput.TagRemove': TagInputTagRemoveProps;
  'TagInput.Input': TagInputInputProps;
}>;
