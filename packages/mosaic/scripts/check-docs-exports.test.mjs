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
    'dist/components/thing.js': `export * as Thing from './thing/thing.parts.js';\n`,
    'dist/components/thing/thing.parts.js': `export const Root = () => null;\n`,
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

  it('fails when a namespace has a member its doc does not list', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'dist/components/thing/thing.parts.js': `export const Root = () => null;\nexport const Secret = () => null;\n`,
      },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing exports Thing.Secret, which its doc does not list');
  });

  it('passes when a second doc in the unit folder lists another export', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'src/components/thing/other-thing.doc.ts': `export default { name: 'OtherThing', parts: { OtherThing: {} } };\n`,
        'dist/components/thing.js': `export * as Thing from './thing/thing.parts.js';\nexport const OtherThing = () => null;\n`,
      },
    });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  it('fails when a second doc in the unit folder lists a missing export', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'src/components/thing/other-thing.doc.ts': `export default { name: 'OtherThing', parts: { OtherThing: {} } };\n`,
      },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing does not export OtherThing');
  });

  it('fails when a doc is nested below the unit folder', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'src/components/thing/parts/other-thing.doc.ts': `export default { name: 'OtherThing', parts: { OtherThing: {} } };\n`,
      },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('src/components/thing/parts/other-thing.doc.ts is not at a documented location');
  });

  it('fails when a name the doc only mentions in prose is exported', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'src/components/thing/thing.doc.ts': `export default { name: 'Thing', description: 'Use \`Other\` instead', parts: { 'Thing.Root': {} } };\n`,
        'dist/components/thing.js': `export * as Thing from './thing/thing.parts.js';\nexport const Other = () => null;\n`,
      },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing exports Other, which its doc does not list');
  });

  it('passes when a helper is listed in the doc exports', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'src/components/thing/thing.doc.ts': `export default { name: 'Thing', parts: { 'Thing.Root': {} }, exports: { 'Thing.useThing': { description: 'Reads the thing.' } } };\n`,
        'dist/components/thing/thing.parts.js': `export const Root = () => null;\nexport const useThing = () => null;\n`,
      },
    });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  it('fails when a helper listed in the doc exports is missing', () => {
    const result = checkDocsExports({
      ...validPackage,
      files: {
        ...validPackage.files,
        'src/components/thing/thing.doc.ts': `export default { name: 'Thing', parts: { 'Thing.Root': {} }, exports: { 'Thing.useThing': { description: 'Reads the thing.' } } };\n`,
      },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing does not export Thing.useThing');
  });
});
