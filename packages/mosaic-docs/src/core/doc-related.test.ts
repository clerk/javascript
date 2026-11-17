import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findRelated } from './doc-related.ts';

const part = { description: '', props: {} };
const button = { name: 'Button', description: '', useFor: [], parts: { Button: part, SubmitButton: part } };
const spinner = { name: 'Spinner', description: '', useFor: [], parts: { Spinner: part } };
const entries = [
  { kind: 'components', slug: 'spinner', doc: spinner },
  { kind: 'components', slug: 'button', doc: button },
] as const;

void test('finds a related doc by its name', () => {
  assert.deepEqual(findRelated([...entries], 'Button'), { place: { kind: 'components', slug: 'button' } });
});

void test('finds a related part on the page that documents it', () => {
  assert.deepEqual(findRelated([...entries], 'SubmitButton'), {
    place: { kind: 'components', slug: 'button' },
    anchor: 'part-submitbutton',
  });
});

void test('finds nothing for a name no page documents', () => {
  assert.equal(findRelated([...entries], 'ActionMenu'), undefined);
});
