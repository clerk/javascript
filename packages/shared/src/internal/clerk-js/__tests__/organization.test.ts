import { describe, expect, it } from 'vitest';

import { isOrganizationId } from '../organization';

describe('isOrganizationId(string)', () => {
  it('should return true for strings starting with `org_`', () => {
    expect(isOrganizationId('org_123')).toBe(true);
    expect(isOrganizationId('org_abc')).toBe(true);
  });

  it('should return false for strings not starting with `org_`', () => {
    expect(isOrganizationId('user_123')).toBe(false);
    expect(isOrganizationId('123org_')).toBe(false);
    expect(isOrganizationId('ORG_123')).toBe(false);
  });

  it('should handle falsy values', () => {
    expect(isOrganizationId(undefined)).toBe(false);
    expect(isOrganizationId(null)).toBe(false);
    expect(isOrganizationId('')).toBe(false);
  });
});
