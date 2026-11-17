import assert from 'node:assert/strict';
import { test } from 'node:test';

import { prefersMarkdown } from './negotiation.ts';

const browser = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

void test('prefers Markdown when the client asks for it', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/x-markdown'), true);
  assert.equal(prefersMarkdown('text/plain'), true);
  assert.equal(prefersMarkdown('TEXT/MARKDOWN'), true);
});

void test('prefers Markdown when it ties with HTML', () => {
  assert.equal(prefersMarkdown('text/html, text/markdown'), true);
});

void test('prefers HTML when it ranks above Markdown', () => {
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false);
});

void test('ignores Markdown the client refuses', () => {
  assert.equal(prefersMarkdown('text/markdown;q=0'), false);
});

void test('serves HTML to browsers, wildcards and clients with no Accept header', () => {
  assert.equal(prefersMarkdown(browser), false);
  assert.equal(prefersMarkdown('*/*'), false);
  assert.equal(prefersMarkdown(null), false);
  assert.equal(prefersMarkdown(''), false);
});
