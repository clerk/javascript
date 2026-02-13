import { describe, expect, test } from 'vitest';

import { compareAppVersions, isValidAppVersion } from '../version';

describe('force-update version comparator', () => {
  test('validates numeric dot-segment versions', () => {
    expect(isValidAppVersion('1')).toBe(true);
    expect(isValidAppVersion('1.2.0')).toBe(true);
    expect(isValidAppVersion('1.2-beta')).toBe(false);
    expect(isValidAppVersion(' 1.2.0 ')).toBe(false);
  });

  test('compares versions using numeric segment semantics', () => {
    expect(compareAppVersions('1.2', '1.2.0')).toBe(0);
    expect(compareAppVersions('1.10', '1.2')).toBe(1);
    expect(compareAppVersions('2.0.0', '2.0.1')).toBe(-1);
  });
});
