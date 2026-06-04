import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Each composed section lives in its own file so bundlers can tree-shake
 * unused sections. parts.ts must only re-export from per-file modules —
 * never import section components directly. If these invariants break,
 * importing one section will pull in every section.
 */

const composedDir = resolve(__dirname, '..');
const userProfileDir = join(composedDir, 'UserProfile');
const orgProfileDir = join(composedDir, 'OrganizationProfile');

function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

function getSectionFiles(dir: string): string[] {
  return readdirSync(dir).filter(
    f =>
      f.endsWith('.tsx') &&
      f !== 'index.tsx' &&
      !f.includes('Provider') &&
      !f.includes('Account.tsx') &&
      !f.includes('Security.tsx') &&
      !f.includes('General.tsx') &&
      !f.includes('Billing.tsx') &&
      !f.includes('APIKeys.tsx') &&
      !f.includes('Members.tsx') &&
      !f.includes('ConfigureSSO.tsx'),
  );
}

describe('tree-shaking: parts.ts only re-exports', () => {
  for (const [label, dir] of [
    ['UserProfile', userProfileDir],
    ['OrganizationProfile', orgProfileDir],
  ] as const) {
    it(`${label}/parts.ts contains only re-export statements`, () => {
      const content = readFile(join(dir, 'parts.ts'));
      const lines = content
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      for (const line of lines) {
        expect(line).toMatch(/^export \{.+\} from '.+';$/);
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
        const content = readFile(join(dir, file));
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
