import assert from 'node:assert/strict';
import { test } from 'node:test';

import { activeSlugs } from './toc.ts';

const view = { top: 64, bottom: 900 };
const box = (slug: string, top: number) => ({ slug, top, bottom: top + 30 });

void test('marks every heading in view active', () => {
  const boxes = [box('use-for', 200), box('practices', 500), box('related', 800)];
  assert.deepEqual(activeSlugs(boxes, view), ['use-for', 'practices', 'related']);
});

void test('leaves out headings scrolled under the header or below the fold', () => {
  const boxes = [box('use-for', 20), box('practices', 300), box('related', 1200)];
  assert.deepEqual(activeSlugs(boxes, view), ['practices']);
});

void test('counts a heading only when most of it is in view', () => {
  const boxes = [box('use-for', 62), box('practices', 880)];
  assert.deepEqual(activeSlugs(boxes, view), ['use-for']);
});

void test('falls back to the last heading above the view inside a long section', () => {
  const boxes = [box('use-for', -900), box('api', -300), box('examples', 1500)];
  assert.deepEqual(activeSlugs(boxes, view), ['api']);
});

void test('marks nothing before the first heading', () => {
  assert.deepEqual(activeSlugs([box('use-for', 1200)], view), []);
});
