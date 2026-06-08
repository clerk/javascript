import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Each composed section lives in its own file so bundlers can tree-shake
 * unused sections. The namespace barrel (index.tsx) imports each leaf
 * individually so property-access tree-shaking on `UserProfile.X` /
 * `OrganizationProfile.X` can drop unused leaves under `sideEffects: false`.
 * Leaves must not import siblings — that would couple sections and defeat
 * dead-code elimination.
 */

const composedDir = resolve(__dirname, '..');
const userProfileDir = join(composedDir, 'UserProfile');
const orgProfileDir = join(composedDir, 'OrganizationProfile');

const SECTION_PREFIX = /^(Account|Security|General)[A-Z]/;

function getSectionFiles(dir: string): string[] {
  return readdirSync(dir).filter(f => f.endsWith('.tsx') && SECTION_PREFIX.test(f));
}

describe('tree-shaking: namespace barrel imports each leaf individually', () => {
  for (const [label, dir] of [
    ['UserProfile', userProfileDir],
    ['OrganizationProfile', orgProfileDir],
  ] as const) {
    const indexPath = join(dir, 'index.tsx');

    it(`${label}/index.tsx does not use \`export *\``, () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).not.toMatch(/export\s+\*/);
    });

    it(`${label}/index.tsx imports each leaf via a direct relative path`, () => {
      const content = readFileSync(indexPath, 'utf-8');
      const importLines = content.split('\n').filter(l => l.trim().startsWith('import'));
      expect(importLines.length).toBeGreaterThan(0);
      for (const line of importLines) {
        const match = line.match(/from\s+['"](.+)['"]/);
        if (!match) continue;
        expect(match[1]).toMatch(/^\.\/[^./]+$/);
      }
    });
  }
});

describe('tree-shaking: section files are self-contained', () => {
  for (const [label, dir] of [
    ['UserProfile', userProfileDir],
    ['OrganizationProfile', orgProfileDir],
  ] as const) {
    const files = getSectionFiles(dir);

    it(`${label} has section files`, () => {
      expect(files.length).toBeGreaterThan(0);
    });

    for (const file of files) {
      it(`${label}/${file} does not import from sibling section files`, () => {
        const content = readFileSync(join(dir, file), 'utf-8');
        const importLines = content.split('\n').filter(l => l.startsWith('import'));

        for (const imp of importLines) {
          const match = imp.match(/from\s+['"](.+)['"]/);
          if (!match) continue;
          const target = match[1];

          // Sibling imports (./OtherSection) would couple sections together.
          // Allowed: imports from ../../components/*, ../createSection, etc.
          if (target.startsWith('./')) {
            throw new Error(
              `${file} imports sibling "${target}" — section files must not import from each other or tree-shaking breaks.`,
            );
          }
        }
      });
    }
  }
});
