import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docToMarkdown } from './doc-markdown.ts';

const noLinks = () => undefined;

void test('renders a component doc with parts, practices, examples and related links', () => {
  const markdown = docToMarkdown(
    {
      name: 'Button',
      description: 'A clickable action.',
      useFor: ['an action that finishes at once'],
      practices: [
        { do: true, text: 'Use `SubmitButton` for async work.' },
        { do: false, text: 'Render a spinner by hand.' },
      ],
      parts: {
        Button: {
          description: 'Renders a `button`.',
          slot: 'cl-button',
          props: {
            color: { type: "'primary' | 'neutral'", doc: 'The color.', default: "'primary'" },
            fullWidth: { type: 'boolean', doc: 'Stretches\nto the container.' },
          },
        },
      },
      examples: [{ title: 'An action', code: '\n<Button onClick={onCancel}>Cancel</Button>\n' }],
      related: ['ProviderButton', 'useConfirmController'],
    },
    name => (name === 'ProviderButton' ? '/docs/components/provider-button.md' : undefined),
  );

  assert.equal(
    markdown,
    `# Button

A clickable action.

## Usage

- an action that finishes at once

## API reference

### Button

Renders a \`button\`.

Slot: \`cl-button\`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`color\` | \`'primary' \\| 'neutral'\` | \`'primary'\` | The color. |
| \`fullWidth\` | \`boolean\` |  | Stretches to the container. |

## Best practices

- Do: Use \`SubmitButton\` for async work.
- Don't: Render a spinner by hand.

## Examples

### An action

\`\`\`tsx
<Button onClick={onCancel}>Cancel</Button>
\`\`\`

## Related

- [ProviderButton](/docs/components/provider-button.md)
- \`useConfirmController\`
`,
  );
});

void test('renders a hook doc with options and returns', () => {
  const markdown = docToMarkdown(
    {
      name: 'usePendingAction',
      description: 'Runs actions under one lock.',
      useFor: ['an async row action'],
      options: { errorFallback: { type: 'string', doc: 'Fallback copy.' } },
      returns: { isPending: { type: 'boolean', doc: 'Whether a run is in flight.' } },
    },
    noLinks,
  );

  assert.match(
    markdown,
    /## Options\n\n\| Prop \| Type \| Default \| Description \|\n.*\n\| `errorFallback` \| `string` \| {2}\| Fallback copy\. \|/,
  );
  assert.match(
    markdown,
    /## Returns\n\n\| Prop \| Type \| Default \| Description \|\n.*\n\| `isPending` \| `boolean` \| {2}\| Whether a run is in flight\. \|/,
  );
  assert.doesNotMatch(markdown, /## Best practices|## Examples|## Related/);
});

void test('leaves out empty hook options and returns', () => {
  const markdown = docToMarkdown(
    { name: 'useToastManager', description: 'Toasts.', useFor: ['a toast'], options: {}, returns: {} },
    noLinks,
  );
  assert.doesNotMatch(markdown, /## Options|## Returns/);
});

void test('fences an example with more backticks than it contains', () => {
  const markdown = docToMarkdown(
    {
      name: 'Code',
      description: 'Code.',
      useFor: ['code'],
      parts: {},
      examples: [{ title: 'Nested', code: '```ts\nconst a = 1;\n```' }],
    },
    noLinks,
  );
  assert.match(markdown, /````tsx\n```ts\nconst a = 1;\n```\n````/);
});

void test('wraps a type containing a backtick in a longer code span', () => {
  const markdown = docToMarkdown(
    {
      name: 'Tpl',
      description: 'Template.',
      useFor: ['template'],
      parts: { Tpl: { description: 'A part.', props: { value: { type: '`${string}px`', doc: 'A size.' } } } },
    },
    noLinks,
  );
  assert.match(markdown, /\| `value` \| `` `\$\{string\}px` `` \|/);
});

void test('keeps a backslash before a pipe inside its table cell', () => {
  const markdown = docToMarkdown(
    {
      name: 'Sep',
      description: 'Separator.',
      useFor: ['splitting'],
      parts: {
        Sep: {
          description: 'A part.',
          props: { sep: { type: String.raw`'\|'`, doc: String.raw`Splits a\|b. Paths like C:\dir stay.` } },
        },
      },
    },
    noLinks,
  );
  const tick = '`';
  assert.ok(
    markdown
      .split('\n')
      .includes(String.raw`| ${tick}sep${tick} | ${tick}'\\\|'${tick} |  | Splits a\\\|b. Paths like C:\dir stay. |`),
    markdown,
  );
});
