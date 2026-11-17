import assert from 'node:assert/strict';
import { test } from 'node:test';

import { highlight } from './highlight.ts';

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
