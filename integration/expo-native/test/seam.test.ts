import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it } from 'node:test';
import { filesUnder, pathsThatLeaveTheTests, posix } from '@clerk/internal-mobile-e2e/testing/seam';

const PACKAGE_DIR = join(import.meta.dirname, '..');

describe('the tests are an e2e project of their own', () => {
  it('keeps specs/ and e2e.config.ts from importing files outside specs/', () => {
    assert.deepEqual(pathsThatLeaveTheTests(PACKAGE_DIR), []);
  });
});

const KEY_PREFIXES = ['sk_test_', 'sk_live_', 'rk_test_', 'rk_live_'];
const SCANNED_KEY = new RegExp(`(?<![A-Za-z0-9])(?:${KEY_PREFIXES.join('|')})(?:[A-Za-z0-9]{24}|[A-Za-z0-9]{40,})(?![A-Za-z0-9])`);

describe('made-up keys in this package', () => {
  it('never have a length that a secret scanner takes for a real key: exactly 24 letters and digits after the prefix, which GitHub refuses to take in a push, or 40 and more', () => {
    const held = filesUnder(PACKAGE_DIR, (name) => name === 'node_modules' || name.startsWith('.'))
      .filter((file) => SCANNED_KEY.test(readFileSync(file, 'utf8')))
      .map((file) => posix(relative(PACKAGE_DIR, file)));
    assert.deepEqual(held, [], 'give the made-up key in each of these files another length');
  });

  it('are told from scanned ones by their length alone', () => {
    for (const prefix of KEY_PREFIXES) {
      for (const length of [24, 40, 42, 99]) assert.equal(SCANNED_KEY.test(`const key = '${prefix}${'a1B2'.repeat(25).slice(0, length)}';`), true, `${prefix} and ${length}`);
      for (const length of [12, 23, 25, 32, 39]) assert.equal(SCANNED_KEY.test(`const key = '${prefix}${'a1B2'.repeat(25).slice(0, length)}';`), false, `${prefix} and ${length}`);
    }
    assert.equal(SCANNED_KEY.test(`pk_test_${'a'.repeat(24)}`), false, 'a publishable key is public');
  });
});
