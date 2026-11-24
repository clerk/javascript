import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docSections, docTabs, overviewHeadings, overviewSections } from './doc-sections.ts';

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
    ['usage', 'api', 'best-practices', 'examples', 'related'],
  );
});

void test('shows parts as a summary on the overview, without their props', () => {
  assert.deepEqual(
    overviewSections(button).map(section => section.id),
    ['usage', 'parts', 'best-practices', 'examples', 'related'],
  );
});

void test('heads the overview with one entry per section', () => {
  assert.deepEqual(overviewHeadings(button), [
    { depth: 2, slug: 'usage', text: 'Usage' },
    { depth: 2, slug: 'parts', text: 'Parts' },
    { depth: 2, slug: 'best-practices', text: 'Best practices' },
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
    ['usage', 'options', 'returns'],
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
    ['usage'],
  );
});

void test('gives a doc with a playground a properties tab for the part it controls', () => {
  const tabs = docTabs({ ...button, playground: { part: 'Button', defaults: { children: 'Save' } } });
  assert.deepEqual(tabs && { part: tabs.part.name, defaults: tabs.defaults }, {
    part: 'Button',
    defaults: { children: 'Save' },
  });
});

void test('gives no properties tab to a playground naming a part the doc lacks', () => {
  assert.equal(docTabs({ ...button, playground: { part: 'Button.Missing' } }), undefined);
});

void test('keeps a doc without a playground on one page', () => {
  assert.equal(docTabs(button), undefined);
});
