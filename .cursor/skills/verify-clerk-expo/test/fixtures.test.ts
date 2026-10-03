import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

describe('specs/fixtures.ts', () => {
  it('names no host-specific screen union, so every repo can copy it unchanged', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'specs', 'fixtures.ts'), 'utf8');
    for (const union of ['NativeHostScreen', 'ExpoHostScreen']) assert.equal(source.includes(union), false, `fixtures.ts names ${union}`);
    assert.match(source, /import type \{ host as hostAdapter \} from '\.\.\/src\/host\.ts';/);
  });
});
