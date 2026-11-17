import assert from 'node:assert/strict';
import { test } from 'node:test';

import { highlight } from './highlight.ts';

void test('highlights with light and dark theme variables and no fixed colors', async () => {
  const html = await highlight("const a = '<b>';", 'tsx');
  assert.match(html, /^<pre class="shiki/);
  assert.match(html, /--shiki-light:#[0-9A-Fa-f]{6}/);
  assert.match(html, /--shiki-dark:#[0-9A-Fa-f]{6}/);
  assert.doesNotMatch(html, /[;"]color:/);
});

void test('escapes markup in the code', async () => {
  const html = await highlight('<Button onClick={go}>Go</Button>', 'tsx');
  assert.doesNotMatch(html, /<Button/);
  assert.match(html, /Button/);
});
