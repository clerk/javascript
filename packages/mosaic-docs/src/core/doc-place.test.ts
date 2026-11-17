import assert from 'node:assert/strict';
import { test } from 'node:test';

import { placeDoc } from './doc-place.ts';

void test('keeps a component doc where its folder puts it', () => {
  assert.deepEqual(placeDoc({ kind: 'components', slug: 'button' }, { name: 'Button', parts: {} }), {
    kind: 'components',
    slug: 'button',
  });
});

void test('files a hook doc under hooks by its name, whatever its folder', () => {
  assert.deepEqual(placeDoc({ kind: 'components', slug: 'toast' }, { name: 'useToastManager' }), {
    kind: 'hooks',
    slug: 'use-toast-manager',
  });
});
