import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderModule, toEntries } from './generate-docs.mjs';

test('maps doc paths to a kind and slug', () => {
  assert.deepEqual(
    toEntries([
      'src/primitives/accordion/accordion.doc.ts',
      'src/hooks/use-pending-action.doc.ts',
      'src/components/button/button.doc.ts',
    ]),
    [
      { kind: 'components', slug: 'button', path: 'src/components/button/button.doc' },
      { kind: 'hooks', slug: 'use-pending-action', path: 'src/hooks/use-pending-action.doc' },
      { kind: 'primitives', slug: 'accordion', path: 'src/primitives/accordion/accordion.doc' },
    ],
  );
});

test('gives a second component in a folder its own slug', () => {
  assert.deepEqual(toEntries(['src/components/button/submit-button.doc.ts']), [
    { kind: 'components', slug: 'submit-button', path: 'src/components/button/submit-button.doc' },
  ]);
});

test('leaves out docs the site does not publish', () => {
  assert.deepEqual(toEntries(['src/components/captcha/captcha.doc.ts', 'src/components/button/button.doc.ts']), [
    { kind: 'components', slug: 'button', path: 'src/components/button/button.doc' },
  ]);
});

test('rejects a doc outside the documented locations', () => {
  assert.throws(
    () => toEntries(['src/components/button/parts/icon.doc.ts']),
    /src\/components\/button\/parts\/icon\.doc\.ts/,
  );
  assert.throws(() => toEntries(['src/blocks/sign-in/sign-in.doc.ts']), /sign-in\.doc\.ts/);
});

test('renders one typed import per doc', () => {
  const source = renderModule('../../../mosaic', [
    { kind: 'components', slug: 'button', path: 'src/components/button/button.doc' },
    { kind: 'hooks', slug: 'use-form', path: 'src/hooks/use-form.doc' },
  ]);
  assert.match(source, /import type \{ ComponentDoc, HookDoc \} from '\.\.\/\.\.\/\.\.\/mosaic\/src\/docs-schema';/);
  assert.match(source, /import doc0 from '\.\.\/\.\.\/\.\.\/mosaic\/src\/components\/button\/button\.doc';/);
  assert.match(source, /import doc1 from '\.\.\/\.\.\/\.\.\/mosaic\/src\/hooks\/use-form\.doc';/);
  assert.match(source, /\{ kind: 'components', slug: 'button', doc: doc0 \}/);
  assert.match(source, /\{ kind: 'hooks', slug: 'use-form', doc: doc1 \}/);
});

test('accepts Windows doc paths', () => {
  assert.deepEqual(toEntries(['src\\components\\button\\button.doc.ts']), [
    { kind: 'components', slug: 'button', path: 'src/components/button/button.doc' },
  ]);
});

test('renders forward-slash imports from a Windows Mosaic directory', () => {
  const source = renderModule('..\\..\\mosaic', [
    { kind: 'components', slug: 'button', path: 'src/components/button/button.doc' },
  ]);
  assert.match(source, /from '\.\.\/\.\.\/mosaic\/src\/docs-schema';/);
  assert.match(source, /import doc0 from '\.\.\/\.\.\/mosaic\/src\/components\/button\/button\.doc';/);
});
