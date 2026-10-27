import path from 'node:path';

import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../../..');

const eslint = new ESLint({ cwd: root });

describe('ported lint policy', () => {
  test('uses the existing assertion policy and excludes tests from internal condition checks', async () => {
    const implementation = await eslint.calculateConfigForFile('packages/mosaic/src/utils/apply-order.ts');
    const tests = await eslint.calculateConfigForFile('packages/mosaic/src/__tests__/object.test.ts');

    expect(implementation.rules['@typescript-eslint/no-unnecessary-condition']?.[0]).toBe(1);
    expect(tests.rules['@typescript-eslint/no-unnecessary-condition']).toBeUndefined();
    expect(implementation.rules['@typescript-eslint/consistent-type-assertions']).toEqual([
      2,
      { assertionStyle: 'never' },
    ]);
    expect(Object.keys(implementation.rules).filter(rule => rule.startsWith('code-quality/'))).toEqual([]);
  });

  test('preserves hook ordering and the React 18 and 19 contract', async () => {
    const config = await eslint.calculateConfigForFile('packages/mosaic/src/index.ts');

    expect(config.rules['react-hooks/rules-of-hooks'][0]).toBe(2);
    expect(config.rules['custom-rules/no-raw-inert'][0]).toBe(2);
    expect(config.rules['react-hooks/refs']).toBeUndefined();
  });

  test('leaves other packages untouched', async () => {
    const config = await eslint.calculateConfigForFile('packages/ui/src/index.ts');

    expect(config.rules['react-hooks/rules-of-hooks'][0]).toBe(1);
    expect(config.rules['no-restricted-syntax']).toBeUndefined();
    expect(Object.keys(config.rules).filter(rule => rule.startsWith('good-css/'))).toEqual([]);
  });

  test('checks authored Mosaic styles despite the selector override', async () => {
    const styles = await eslint.calculateConfigForFile('packages/mosaic/src/components/button/button.styles.ts');
    const component = await eslint.calculateConfigForFile('packages/mosaic/src/components/button/button.tsx');

    for (const rule of ['explicit-transition-properties', 'reduced-motion', 'preserve-focus-outline']) {
      expect(styles.rules[`good-css/${rule}`]?.[0]).toBeGreaterThan(0);
      expect(component.rules[`good-css/${rule}`]).toBeUndefined();
    }
  });

  test.each([
    ['marginTop', 'marginBlockStart'],
    ['marginBottom', 'marginBlockEnd'],
    ['paddingTop', 'paddingBlockStart'],
    ['paddingBottom', 'paddingBlockEnd'],
  ])('uses StyleX to reject %s and accept %s', async (physical, logical) => {
    for (const [property, expected] of [
      [physical, 1],
      [logical, 0],
    ]) {
      const [result] = await eslint.lintText(
        `import * as stylex from '@stylexjs/stylex'; export const styles = stylex.create({base: {${property}: 4}});`,
        { filePath: 'packages/mosaic/src/components/button/button.styles.ts' },
      );
      expect(result.messages.filter(message => message.fatal)).toEqual([]);
      expect(result.messages.filter(message => message.ruleId === '@stylexjs/valid-styles')).toHaveLength(expected);
    }
  });

  test('limits unnecessary-condition checks to internal Mosaic logic', async () => {
    const internal = await eslint.calculateConfigForFile('packages/mosaic/src/utils/apply-order.ts');
    const boundary = await eslint.calculateConfigForFile('packages/shared/src/object.ts');

    expect(internal.rules['@typescript-eslint/no-unnecessary-condition']?.[0]).toBe(1);
    expect(boundary.rules['@typescript-eslint/no-unnecessary-condition']).toBeUndefined();
  });
});
