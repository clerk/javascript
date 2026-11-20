import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const allowed = {
  core: [],
  ui: ['@/core/'],
  next: ['@/core/'],
} as const;

for (const [layer, layers] of Object.entries(allowed)) {
  void test(`${layer} imports only packages, its own files and ${layers.join(', ') || 'nothing else'}`, () => {
    const files = globSync(`src/${layer}/*.{ts,tsx}`, { cwd: import.meta.dirname + '/..' });
    assert.ok(files.length > 0);
    const offending = files.flatMap(file =>
      [...readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').matchAll(/from '([^']+)'/g)]
        .map(match => match[1] ?? '')
        .filter(
          source =>
            (source.startsWith('@/') || source.startsWith('../')) &&
            ![`@/${layer}/`, ...layers].some(l => source.startsWith(l)),
        )
        .map(source => `${file}: ${source}`),
    );
    assert.deepEqual(offending, []);
  });
}
