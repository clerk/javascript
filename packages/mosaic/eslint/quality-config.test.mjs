import path from 'node:path';

import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../../..');

const eslint = new ESLint({ cwd: root });

describe('ported lint policy', () => {
  test('checks Mosaic implementation code without rejecting test assertions', async () => {
    const implementation = await eslint.calculateConfigForFile('packages/mosaic/src/utils/apply-order.ts');
    const tests = await eslint.calculateConfigForFile('packages/mosaic/src/__tests__/object.test.ts');

    expect(implementation.rules['e18e/no-spread-in-reduce']?.[0]).toBe(1);
    expect(tests.rules['e18e/no-spread-in-reduce']).toBeUndefined();
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
    expect(Object.keys(config.rules).filter(rule => /^(code-quality|good-css)\//.test(rule))).toEqual([]);
  });

  test('checks authored Mosaic styles despite the selector override', async () => {
    const styles = await eslint.calculateConfigForFile('packages/mosaic/src/components/button/button.styles.ts');
    const component = await eslint.calculateConfigForFile('packages/mosaic/src/components/button/button.tsx');

    for (const rule of [
      'explicit-transition-properties',
      'reduced-motion',
      'preserve-focus-outline',
      'logical-spacing',
    ]) {
      expect(styles.rules[`good-css/${rule}`]?.[0]).toBeGreaterThan(0);
      expect(component.rules[`good-css/${rule}`]).toBeUndefined();
    }
  });

  test('limits unnecessary-condition checks to internal Mosaic logic', async () => {
    const internal = await eslint.calculateConfigForFile('packages/mosaic/src/utils/apply-order.ts');
    const boundary = await eslint.calculateConfigForFile('packages/shared/src/object.ts');

    expect(internal.rules['@typescript-eslint/no-unnecessary-condition']?.[0]).toBe(1);
    expect(boundary.rules['@typescript-eslint/no-unnecessary-condition']).toBeUndefined();
  });
});
