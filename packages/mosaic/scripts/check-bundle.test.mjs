import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const script = resolve(import.meta.dirname, 'check-bundle.mjs');

const validDist = {
  'index.js': `'use client';\nimport { a } from "@clerk/shared/react";\nimport { b } from "@floating-ui/react";\nexport { a, b };\n`,
  'components/thing.js': `import { thing_parts_exports } from "./thing/thing.parts.js";\nexport { thing_parts_exports as Thing };\n`,
  'components/thing/thing.parts.js': `import { Root } from "./thing.js";\nexport { Root };\n`,
  'components/thing/thing.js': `'use client';\nimport React from "react";\nfunction Root() {}\nexport { Root };\n`,
  'icons/glyphs/thing.js': `'use client';\nimport { glyph } from "../glyph.js";\nconst Thing = glyph("thing");\nexport { Thing };\n`,
  'icons/glyph.js': `import * as React from "react";\nfunction glyph() {}\nexport { glyph };\n`,
};

function checkBundle(dist) {
  const packageDir = mkdtempSync(join(tmpdir(), 'mosaic-check-bundle-'));
  writeFileSync(
    join(packageDir, 'package.json'),
    JSON.stringify({
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' },
        './components/thing': { types: './dist/components/thing.d.ts', import: './dist/components/thing.js' },
        './icons/glyphs/thing': { types: './dist/icons/glyphs/thing.d.ts', import: './dist/icons/glyphs/thing.js' },
      },
    }),
  );
  for (const [file, source] of Object.entries(dist)) {
    mkdirSync(dirname(join(packageDir, 'dist', file)), { recursive: true });
    writeFileSync(join(packageDir, 'dist', file), source);
  }
  return spawnSync(process.execPath, [script, packageDir], { encoding: 'utf8' });
}

describe('check-bundle', () => {
  it('passes when every React module behind an entry is a client module', () => {
    expect(checkBundle(validDist).status).toBe(0);
  });

  it('fails when a component entry starts with use client', () => {
    const result = checkBundle({
      ...validDist,
      'components/thing.js': `'use client';\n${validDist['components/thing.js']}`,
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing.js starts with');
  });

  it('fails when a React module two re-exports past an entry has no use client', () => {
    const result = checkBundle({
      ...validDist,
      'components/thing/thing.parts.js': `import { Root } from "./indirect.js";\nexport { Root };\n`,
      'components/thing/indirect.js': `import { Root } from "./thing-server.js";\nexport { Root };\n`,
      'components/thing/thing-server.js': `import React from "react";\nfunction Root() {}\nexport { Root };\n`,
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing/thing-server.js');
  });

  it('fails when a module outside a client boundary imports a React library', () => {
    const result = checkBundle({
      ...validDist,
      'components/thing/thing.parts.js': `import { useFloating } from "@floating-ui/react";\nimport { Root } from "./thing.js";\nexport { Root, useFloating };\n`,
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('components/thing/thing.parts.js');
  });

  it('fails when a glyph entry does not start with use client', () => {
    const result = checkBundle({
      ...validDist,
      'icons/glyphs/thing.js': validDist['icons/glyphs/thing.js'].replace("'use client';\n", ''),
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('icons/glyphs/thing.js');
  });
});
