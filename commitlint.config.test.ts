import { describe, expect, it } from 'vitest';

import Configuration, { ALLOWED_CAMEL_CASE_TERMS, CAMEL_CASE_PATTERN, getPackageNames } from './commitlint.config';

describe('commitlint.config', () => {
  describe('getPackageNames', () => {
    it('returns an array of package names', () => {
      const packageNames = getPackageNames();

      expect(Array.isArray(packageNames)).toBe(true);
      expect(packageNames.length).toBeGreaterThan(0);
    });

    it('includes known packages', () => {
      const packageNames = getPackageNames();

      expect(packageNames).toContain('clerk-js');
      expect(packageNames).toContain('js');
      expect(packageNames).toContain('nextjs');
      expect(packageNames).toContain('react');
      expect(packageNames).toContain('backend');
    });

    it('includes both full name and clerk- stripped version', () => {
      const packageNames = getPackageNames();

      expect(packageNames).toContain('clerk-js');
      expect(packageNames).toContain('js');
    });
  });

  describe('ALLOWED_CAMEL_CASE_TERMS', () => {
    it('is alphabetically sorted', () => {
      const sorted = [...ALLOWED_CAMEL_CASE_TERMS].sort();
      expect(ALLOWED_CAMEL_CASE_TERMS).toEqual(sorted);
    });

    it('contains common React hooks', () => {
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('useEffect');
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('useState');
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('useCallback');
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('useMemo');
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('useRef');
    });

    it('contains common DOM APIs', () => {
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('getElementById');
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('localStorage');
      expect(ALLOWED_CAMEL_CASE_TERMS).toContain('sessionStorage');
    });
  });

  describe('CAMEL_CASE_PATTERN', () => {
    it('matches commit messages containing allowed terms', () => {
      expect(CAMEL_CASE_PATTERN.test('fix(js): update useEffect cleanup')).toBe(true);
      expect(CAMEL_CASE_PATTERN.test('feat(react): add useState helper')).toBe(true);
      expect(CAMEL_CASE_PATTERN.test('fix(ui): localStorage issue')).toBe(true);
    });

    it('does not match commit messages without allowed terms', () => {
      expect(CAMEL_CASE_PATTERN.test('fix(js): update component')).toBe(false);
      expect(CAMEL_CASE_PATTERN.test('feat(react): add new feature')).toBe(false);
    });

    it('matches terms as whole words only', () => {
      expect(CAMEL_CASE_PATTERN.test('fix: useEffect')).toBe(true);
      expect(CAMEL_CASE_PATTERN.test('fix: myuseEffect')).toBe(false);
      expect(CAMEL_CASE_PATTERN.test('fix: useEffectCustom')).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('extends @commitlint/config-conventional', () => {
      expect(Configuration.extends).toContain('@commitlint/config-conventional');
    });

    it('has an ignores function that uses CAMEL_CASE_PATTERN', () => {
      expect(Configuration.ignores).toHaveLength(1);

      const ignoreFn = Configuration.ignores[0];
      expect(ignoreFn('fix(js): update useEffect')).toBe(true);
      expect(ignoreFn('fix(js): update component')).toBe(false);
    });

    it('has required rules configured', () => {
      expect(Configuration.rules).toHaveProperty('body-max-line-length');
      expect(Configuration.rules).toHaveProperty('scope-empty');
      expect(Configuration.rules).toHaveProperty('scope-enum');
      expect(Configuration.rules).toHaveProperty('subject-case');
    });

    it('requires a scope (scope-empty rule)', () => {
      const [level, applicable] = Configuration.rules['scope-empty'];
      expect(level).toBe(2);
      expect(applicable).toBe('never');
    });

    it('allows lower-case and sentence-case subjects', () => {
      const [level, applicable, cases] = Configuration.rules['subject-case'];
      expect(level).toBe(2);
      expect(applicable).toBe('always');
      expect(cases).toContain('lower-case');
      expect(cases).toContain('sentence-case');
    });

    it('includes standard scopes in scope-enum', () => {
      const [, , scopes] = Configuration.rules['scope-enum'];
      expect(scopes).toContain('repo');
      expect(scopes).toContain('release');
      expect(scopes).toContain('e2e');
      expect(scopes).toContain('*');
      expect(scopes).toContain('ci');
    });
  });
});
