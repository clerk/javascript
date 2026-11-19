import assert from 'node:assert/strict';
import { test } from 'node:test';

import { controlFor, playgroundCode, playgroundContent, playgroundValues } from './playground.ts';

const props = {
  variant: { type: "'filled' | 'outline' | 'ghost' | 'link'", doc: 'Variant.', default: "'filled'" },
  size: { type: "'xs' | 'sm' | 'md' | 'lg'", doc: 'Size.', default: "'md'" },
  fullWidth: { type: 'boolean', doc: 'Stretches.', default: 'false' },
  touchTarget: { type: 'boolean', doc: 'Grows the hit area.', default: 'true' },
  spinDelay: { type: 'SpinDelayOptions', doc: 'Delay.' },
};

void test('gives a string-literal union a select of its members', () => {
  assert.deepEqual(controlFor("'filled' | 'outline' | 'ghost'"), {
    kind: 'select',
    options: ['filled', 'outline', 'ghost'],
  });
});

void test('gives a boolean a switch', () => {
  assert.deepEqual(controlFor('boolean'), { kind: 'switch' });
});

void test('gives a string or a ReactNode a text field', () => {
  assert.deepEqual(controlFor('string'), { kind: 'text' });
  assert.deepEqual(controlFor('ReactNode'), { kind: 'text' });
});

void test('gives no control to a type it cannot edit', () => {
  for (const type of ['SpinDelayOptions', 'ReactNode[]', '(open: boolean) => void', "'a' | number", "'only'"]) {
    assert.deepEqual(controlFor(type), { kind: 'none' }, type);
  }
});

void test('starts each controlled prop at its documented default, then applies the playground defaults', () => {
  assert.deepEqual(playgroundValues(props, { children: 'Save changes', size: 'sm' }), {
    variant: 'filled',
    size: 'sm',
    fullWidth: false,
    touchTarget: true,
    children: 'Save changes',
  });
});

void test('drops playground defaults it cannot print', () => {
  assert.deepEqual(playgroundValues({}, { children: 'Save', onClick: () => {}, count: 2 }), { children: 'Save' });
});

void test('prints only the props that differ from their documented default', () => {
  const values = playgroundValues(props, { children: 'Save changes' });
  assert.equal(playgroundCode('Button', props, values), '<Button>Save changes</Button>');
});

void test('prints one changed prop inline', () => {
  assert.equal(
    playgroundCode('Button', props, { variant: 'outline', size: 'md', children: 'Save changes' }),
    "<Button variant='outline'>Save changes</Button>",
  );
});

void test('prints several changed props one per line, with a bare true and a braced false', () => {
  assert.equal(
    playgroundCode('Button', props, { variant: 'ghost', fullWidth: true, touchTarget: false, children: 'Save' }),
    ['<Button', "  variant='ghost'", '  fullWidth', '  touchTarget={false}', '>', '  Save', '</Button>'].join('\n'),
  );
});

void test('self-closes with empty children', () => {
  assert.equal(playgroundCode('Button', props, { children: '' }), '<Button />');
});

void test('self-closes without children', () => {
  assert.equal(playgroundCode('Button', props, { variant: 'link' }), "<Button variant='link' />");
});

const card = {
  __element: 'Card.Header',
  children: [
    { __element: 'Card.Title', children: 'Title' },
    { __element: 'Button', props: { variant: 'outline', fullWidth: true }, children: 'Cancel' },
  ],
};

void test('reads composed children from the playground defaults', () => {
  assert.deepEqual(playgroundContent({ children: [card, 'text'] }), [
    {
      element: 'Card.Header',
      props: {},
      children: [
        { element: 'Card.Title', props: {}, children: ['Title'] },
        { element: 'Button', props: { variant: 'outline', fullWidth: true }, children: ['Cancel'] },
      ],
    },
    'text',
  ]);
});

void test('reads no composed children from a plain or missing children default', () => {
  assert.equal(playgroundContent({ children: 'Save' }), undefined);
  assert.equal(playgroundContent({}), undefined);
});

void test('prints composed children nested inside the root', () => {
  const content = playgroundContent({ children: card });
  assert.equal(
    playgroundCode('Card.Root', props, { size: 'sm' }, content),
    [
      "<Card.Root size='sm'>",
      '  <Card.Header>',
      '    <Card.Title>Title</Card.Title>',
      '    <Button',
      "      variant='outline'",
      '      fullWidth',
      '    >',
      '      Cancel',
      '    </Button>',
      '  </Card.Header>',
      '</Card.Root>',
    ].join('\n'),
  );
});

void test('prints composed children under several root props', () => {
  const content = playgroundContent({ children: { __element: 'Card.Content' } });
  assert.equal(
    playgroundCode('Card.Root', props, { size: 'sm', fullWidth: true }, content),
    ['<Card.Root', "  size='sm'", '  fullWidth', '>', '  <Card.Content />', '</Card.Root>'].join('\n'),
  );
});
