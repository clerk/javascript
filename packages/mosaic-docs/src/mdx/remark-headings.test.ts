import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

import remarkHeadings from './remark-headings.ts';

async function compile(source: string) {
  return evaluate(source, { ...runtime, remarkPlugins: [remarkHeadings] });
}

void test('exports h2 and h3 headings as table of contents entries', async () => {
  const { headings } = await compile('# Title\n\n## Getting started\n\n### With `pnpm`\n\n#### Too deep\n');
  assert.deepEqual(headings, [
    { depth: 2, slug: 'getting-started', text: 'Getting started' },
    { depth: 3, slug: 'with-pnpm', text: 'With pnpm' },
  ]);
});

void test('gives every heading an id that matches its slug', async () => {
  const { default: Content } = await compile('## Hooks\n\n### Hooks\n');
  assert.equal(renderToStaticMarkup(Content({})), '<h2 id="hooks">Hooks</h2>\n<h3 id="hooks-1">Hooks</h3>');
});

void test('exports no headings for a page without sections', async () => {
  const { headings } = await compile('# Title\n\nJust text.\n');
  assert.deepEqual(headings, []);
});
