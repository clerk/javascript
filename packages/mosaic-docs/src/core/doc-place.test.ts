import assert from 'node:assert/strict';
import { test } from 'node:test';

import { placeDocs } from './doc-place.ts';

const button = { name: 'Button', description: '', useFor: [], parts: {} };
const useToastManager = { name: 'useToastManager', description: '', useFor: [], returns: {} };

void test('keeps a component doc where its folder puts it', () => {
  assert.deepEqual(placeDocs([{ kind: 'components', slug: 'button', doc: button }]), [
    { kind: 'components', slug: 'button', doc: button },
  ]);
});

void test('files a hook doc under hooks by its name, whatever its folder', () => {
  assert.deepEqual(placeDocs([{ kind: 'components', slug: 'toast', doc: useToastManager }]), [
    { kind: 'hooks', slug: 'use-toast-manager', doc: useToastManager },
  ]);
});

void test('rejects two docs that land on the same page', () => {
  assert.throws(
    () =>
      placeDocs([
        { kind: 'components', slug: 'toast', doc: useToastManager },
        { kind: 'hooks', slug: 'use-toast-manager', doc: useToastManager },
      ]),
    /hooks\/use-toast-manager/,
  );
});
