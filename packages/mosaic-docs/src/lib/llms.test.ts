import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmsFull, llmsIndex } from './llms.ts';

const site = { name: 'Mosaic', description: 'A component library.', details: 'Install with `pnpm add @clerk/mosaic`.' };

void test('renders the index with details, linked sections and agent resources', () => {
  const index = llmsIndex(site, [
    {
      title: 'Components',
      pages: [{ title: 'Button', href: '/docs/components/button', description: 'A clickable action.' }],
    },
    {
      title: 'Hooks',
      pages: [{ title: 'useForm', href: '/docs/hooks/use-form', description: 'Form state.' }],
    },
  ]);

  assert.equal(
    index,
    `# Mosaic

> A component library.

Install with \`pnpm add @clerk/mosaic\`.

## Components

- [Button](/docs/components/button.md): A clickable action.

## Hooks

- [useForm](/docs/hooks/use-form.md): Form state.

## Agent resources

- [llms-full.txt](/llms-full.txt): The full Markdown of every page in one file.
- [Page Markdown](/docs.md): Append \`.md\` to any docs page URL to fetch that page as Markdown.
`,
  );
});

void test('leaves out a section with no pages', () => {
  const index = llmsIndex(site, [{ title: 'Primitives', pages: [] }]);
  assert.doesNotMatch(index, /## Primitives/);
});

void test('renders the full corpus with a source line per page', () => {
  const full = llmsFull(site, [
    { href: '/docs/components/button', markdown: '# Button\n\nA clickable action.\n' },
    { href: '/docs/hooks/use-form', markdown: '# useForm\n\nForm state.\n' },
  ]);

  assert.equal(
    full,
    `# Mosaic

> A component library.

# Button
Source: /docs/components/button

A clickable action.

---

# useForm
Source: /docs/hooks/use-form

Form state.
`,
  );
});
