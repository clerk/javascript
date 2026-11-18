import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const script = resolve(import.meta.dirname, 'check-docs-exports.mjs');

const thingExport = { types: './dist/components/thing.d.ts', import: './dist/components/thing.js' };
const validPackage = {
  exports: { './components/thing': thingExport },
  files: {
    'src/components/thing/thing.doc.ts': `export default { name: 'Thing', parts: { 'Thing.Root': {} } };\n`,
    'dist/components/thing.d.ts': `export {};\n`,
    'dist/components/thing.js': `export const Thing = { Root: () => null };\n`,
  },
};

function checkDocsExports({ exports, files }) {
  const packageDir = mkdtempSync(join(tmpdir(), 'mosaic-check-docs-exports-'));
  writeFileSync(join(packageDir, 'package.json'), JSON.stringify({ type: 'module', exports }));
  for (const [file, source] of Object.entries(files)) {
    mkdirSync(dirname(join(packageDir, file)), { recursive: true });
    writeFileSync(join(packageDir, file), source);
  }
  return spawnSync(process.execPath, [script, packageDir], { encoding: 'utf8' });
}

describe('check-docs-exports', () => {
  it('passes when each documented unit exports what its doc names', () => {
    expect(checkDocsExports(validPackage).status).toBe(0);
  });

  it('fails when a unit is exported without a doc', () => {
    const result = checkDocsExports({
      exports: { ...validPackage.exports, './components/extra': thingExport },
      files: validPackage.files,
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/extra is exported but has no doc');
  });
});
