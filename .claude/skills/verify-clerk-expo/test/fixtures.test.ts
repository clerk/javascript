import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

describe('specs/fixtures.ts', () => {
  it('names no host-specific screen union, and takes its screens from the host it imports', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'specs', 'fixtures.ts'), 'utf8');
    for (const union of ['NativeHostScreen', 'ExpoHostScreen']) assert.equal(source.includes(union), false, `fixtures.ts names ${union}`);
    assert.match(source, /import type \{ host as hostAdapter \} from '\.\.\/src\/host\.ts';/);
  });

  it('taps a position inside the node and fills through that tap, because agent-device 0.21.18 refuses a plain tap or fill under the full-screen Toolbar node an iOS 27 SwiftUI toolbar adds', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'specs', 'fixtures.ts'), 'utf8');
    assert.match(source, /await target\.tap\(\{ position: \{ x: box\.width \/ 2, y: box\.height \/ 2 \} \}\);/);
    assert.match(source, /async fill\(field, text\) \{\n\s+await host\.tap\(field\);/);
    assert.doesNotMatch(source, /\.fill\(/);
  });
});
