import assert from 'node:assert/strict';
import { test } from 'node:test';

import { highlight, highlightTokens } from './highlight.ts';

void test('colors tokens with theme variables instead of fixed colors', async () => {
  const html = await highlight("const a = '<b>';", 'tsx');
  assert.match(html, /^<pre class="shiki/);
  assert.match(html, /color:var\(--shiki-token-keyword\)/);
  assert.match(html, /color:var\(--shiki-token-string/);
  assert.doesNotMatch(html, /#[0-9A-Fa-f]{6}/);
});

void test('escapes markup in the code', async () => {
  const html = await highlight('<Button onClick={go}>Go</Button>', 'tsx');
  assert.doesNotMatch(html, /<Button/);
  assert.match(html, /Button/);
});

void test('splits one line into colored tokens', async () => {
  assert.deepEqual(await highlightTokens('pnpm add @clerk/mosaic', 'sh'), [
    { content: 'pnpm', color: 'var(--shiki-token-function)' },
    { content: ' ', color: 'var(--shiki-foreground)' },
    { content: 'add', color: 'var(--shiki-token-string)' },
    { content: ' ', color: 'var(--shiki-foreground)' },
    { content: '@clerk/mosaic', color: 'var(--shiki-token-string)' },
  ]);
});
