import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docHeadings, docSections } from './doc-sections.ts';

const button = {
  name: 'Button',
  description: 'A clickable action.',
  useFor: ['an action'],
  practices: [{ do: true, text: 'Label the action.' }],
  parts: {
    Button: { description: 'Renders a `button`.' },
    'Button.Icon': { description: 'An icon.' },
  },
  examples: [{ title: 'An action', code: '<Button />' }],
  related: ['Link'],
};

void test('lists the sections a component doc has, in page order', () => {
  assert.deepEqual(
    docSections(button).map(section => section.id),
    ['use-for', 'practices', 'api', 'examples', 'related'],
  );
});

void test('heads a component doc with its sections and one entry per part', () => {
  assert.deepEqual(docHeadings(button), [
    { depth: 2, slug: 'use-for', text: 'Use for' },
    { depth: 2, slug: 'practices', text: 'Practices' },
    { depth: 2, slug: 'api', text: 'API reference' },
    { depth: 3, slug: 'part-button', text: 'Button' },
    { depth: 3, slug: 'part-button-icon', text: 'Button.Icon' },
    { depth: 2, slug: 'examples', text: 'Examples' },
    { depth: 2, slug: 'related', text: 'Related' },
  ]);
});

void test('lists the options and returns of a hook doc', () => {
  assert.deepEqual(
    docSections({
      name: 'useForm',
      description: 'Form state.',
      useFor: ['a form'],
      options: { initial: { type: 'object', doc: 'Initial values.' } },
      returns: { values: { type: 'object', doc: 'The values.' } },
    }).map(section => section.id),
    ['use-for', 'options', 'returns'],
  );
});

void test('leaves out empty optional sections', () => {
  assert.deepEqual(
    docSections({
      name: 'useNow',
      description: 'The time.',
      useFor: ['a clock'],
      practices: [],
      options: {},
      returns: {},
      examples: [],
      related: [],
    }).map(section => section.id),
    ['use-for'],
  );
});
