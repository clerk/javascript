import { describe, expect, it } from 'vitest';

import { hasMultipleEnterpriseConnections } from '../shared';

describe('hasMultipleEnterpriseConnections', () => {
  it('accepts selectable connections with missing names', () => {
    expect(
      hasMultipleEnterpriseConnections([
        { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_1' },
        { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_2', enterpriseConnectionName: '' },
      ]),
    ).toBe(true);
  });
  it('rejects mixed strategies and missing IDs', () => {
    expect(
      hasMultipleEnterpriseConnections([
        { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_1' },
        { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_2' },
        { strategy: 'password' },
      ]),
    ).toBe(false);
    expect(
      hasMultipleEnterpriseConnections([
        { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_1' },
        { strategy: 'enterprise_sso', enterpriseConnectionName: 'Google' },
      ]),
    ).toBe(false);
  });
});
