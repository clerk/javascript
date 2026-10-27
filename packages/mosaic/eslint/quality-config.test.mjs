import path from 'node:path';

import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../../..');

const eslint = new ESLint({ cwd: root });

describe('ported lint policy', () => {
  test('checks Mosaic implementation code without rejecting test assertions', async () => {
    const implementation = await eslint.calculateConfigForFile('packages/mosaic/src/utils/apply-order.ts');
    const tests = await eslint.calculateConfigForFile('packages/mosaic/src/__tests__/object.test.ts');

    for (const rule of ['no-accumulator-copy', 'no-chained-type-assertions']) {
      expect(implementation.rules[`code-quality/${rule}`]?.[0]).toBe(1);
      expect(tests.rules[`code-quality/${rule}`]).toBeUndefined();
    }
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
});
