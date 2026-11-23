import { createRequire } from 'node:module';

import noUnneededEffects from 'eslint-plugin-react-you-might-not-need-an-effect';
import { describe, expect, test } from 'vitest';

const require = createRequire(import.meta.url);
import config from '../../oxlint.config.mjs';

import { findOverride, overrides, ruleOptions, rules } from './mosaic-config.ts';
import rootConfig from '../../../../oxlint.config.mjs';

const testFiles = ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'];

describe('Mosaic rule configuration', () => {
  test('registers the custom and third-party plugins', () => {
    expect(config.plugins).toEqual(expect.arrayContaining(['typescript', 'vitest']));
    expect(config.jsPlugins).toEqual(
      expect.arrayContaining([
        { name: 'mosaic', specifier: './lint/plugin.ts' },
        { name: '@stylexjs', specifier: '@stylexjs/eslint-plugin' },
        expect.objectContaining({ name: 'eslint-compat' }),
        'eslint-plugin-boundaries',
        'eslint-plugin-react-you-might-not-need-an-effect',
      ]),
    );
  });

  test.each([
    {
      rule: 'mosaic/no-model-react-state',
      files: ['src/**/*.model.{ts,tsx}'],
      excludeFiles: [],
    },
    {
      rule: 'mosaic/no-dynamic-message-catalogs',
      files: ['src/**/*.{view,controller}.{ts,tsx}'],
      excludeFiles: [],
    },
    {
      rule: 'mosaic/forward-ref-parts',
      files: ['src/primitives/**/*.tsx', 'src/components/**/*.tsx'],
      excludeFiles: testFiles,
    },
    {
      rule: 'mosaic/no-raw-invoke',
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: [...testFiles, 'src/**/*.test-d.{ts,tsx}'],
    },
    {
      rule: 'mosaic/no-render-clock',
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: ['src/hooks/use-now.ts', 'src/mosaic-provider.tsx', ...testFiles, 'src/**/*.test-d.{ts,tsx}'],
    },
  ])('enables $rule only in its intended files', ({ rule, files, excludeFiles }) => {
    const matching = overrides.filter(override => rule in override.rules);
    expect(matching).toHaveLength(1);
    expect(matching[0].rules[rule]).toBe('error');
    expect(matching[0].files).toEqual(files);
    expect(matching[0].excludeFiles ?? []).toEqual(excludeFiles);
    expect(rules[rule]).toBeUndefined();
  });

  test('enables boundary checks in production source files', () => {
    const override = findOverride(override => 'boundaries/dependencies' in override.rules);
    expect(override.files).toEqual(['src/**/*']);
    expect(override.excludeFiles).toEqual([...testFiles, 'src/**/*.test-d.ts']);
    expect(ruleOptions(override, 'boundaries/dependencies')[0]).toBe('error');
  });

  test('keeps type-aware checks and StyleX checks enabled in production source files', () => {
    const override = findOverride(override => '@stylexjs/enforce-extension' in override.rules);
    expect(config.options.typeAware).toBe(true);
    expect(override.files).toEqual(['src/**/*']);
    expect(override.excludeFiles).toEqual(['src/__tests__/**', 'src/**/*.test.{ts,tsx}']);
    expect(override.rules).toMatchObject({
      'typescript/no-floating-promises': 'error',
      'typescript/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@stylexjs/enforce-extension': 'error',
    });
  });

  test('requires import type in TypeScript source files', () => {
    const override = findOverride(override => 'typescript/no-import-type-side-effects' in override.rules);
    expect(override.files).toEqual(['src/**/*.{ts,tsx}']);
    expect(override.rules['typescript/no-import-type-side-effects']).toBe('error');
  });

  test('enables Vitest assertions and rejects focused or duplicate tests', () => {
    const override = findOverride(override => 'vitest/expect-expect' in override.rules);
    expect(override.files).toEqual(['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}']);
    expect(override.excludeFiles).toEqual(['src/**/*.test-d.{ts,tsx}']);
    expect(override.rules).toMatchObject({
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expect*', 'assert*'] }],
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
    });
  });

  test('restricts effects in features while allowing shared hooks and primitives', () => {
    const override = findOverride(override => 'react-you-might-not-need-an-effect/no-derived-state' in override.rules);
    expect(override.files).toEqual(['src/features/**/*.{ts,tsx}']);
    expect(override.excludeFiles).toEqual([...testFiles, 'src/**/*.test-d.{ts,tsx}']);
    expect(override.rules).toEqual(noUnneededEffects.configs.strict.rules);
    expect(override.rules).toMatchObject({
      'react-you-might-not-need-an-effect/no-derived-state': 'error',
      'react-you-might-not-need-an-effect/no-event-handler': 'error',
    });
  });

  test('enables the Mosaic syntax guards in their intended files', () => {
    const syntaxOverrides = overrides.filter(override => 'eslint-compat/no-restricted-syntax' in override.rules);
    expect(syntaxOverrides.map(override => override.files)).toEqual([
      ['src/**/*'],
      ['src/features/**/*', 'src/blocks/**/*'],
      ['src/**/*.styles.ts'],
      ['src/primitives/**/*'],
    ]);
    for (const override of syntaxOverrides) {
      expect(ruleOptions(override, 'eslint-compat/no-restricted-syntax')[0]).toBe('error');
    }
    expect(syntaxOverrides[0].excludeFiles).toEqual(['src/__tests__/**', 'src/**/*.test.{ts,tsx}']);
    expect(syntaxOverrides[1].excludeFiles).toEqual(testFiles);
    expect(syntaxOverrides[3].excludeFiles).toEqual(['src/**/*.test.{ts,tsx}']);
  });

  test('inherits repository import restrictions and keeps Mosaic guards local', () => {
    expect(config.rules['no-restricted-imports']).toEqual(rootConfig.rules['no-restricted-imports']);
    const [severity, imports] = config.rules['no-restricted-imports'];
    expect(severity).toBe('error');
    expect(imports.paths).toEqual(expect.arrayContaining([expect.objectContaining({ name: '@clerk/shared' })]));
    expect(imports.patterns).toEqual(expect.arrayContaining([expect.objectContaining({ group: ['@emotion/*'] })]));
    for (const rules of [rootConfig.rules, ...rootConfig.overrides.map(override => override.rules)]) {
      expect(Object.keys(rules).some(rule => /^(mosaic|boundaries)\//.test(rule))).toBe(false);
    }
  });
});
