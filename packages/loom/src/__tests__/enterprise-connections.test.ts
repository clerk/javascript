import { describe, expect, it } from 'vitest';

import { parseEnterpriseConnections } from '../enterprise-connections';

describe('eligible enterprise connections', () => {
  it('projects only safe connection fields and rejects malformed lists', () => {
    const connections = parseEnterpriseConnections([
      {
        id: 'ec_1',
        name: 'Acme',
        allow_organization_account_linking: true,
        logo_public_url: 'https://img.example/acme',
        secret: 'private',
      },
    ]);
    expect(connections).toEqual([
      { id: 'ec_1', name: 'Acme', allowOrganizationAccountLinking: true, logoPublicUrl: 'https://img.example/acme' },
    ]);
    expect(JSON.stringify(connections)).not.toContain('private');
    expect(() => parseEnterpriseConnections(undefined)).toThrow();
    expect(() => parseEnterpriseConnections([{ id: 'ec_1', name: 'Acme' }])).toThrow();
  });
  it('accepts the requesting-user FAPI response envelope', () => {
    expect(
      parseEnterpriseConnections({
        response: [{ id: 'ec_1', name: 'Acme', allow_organization_account_linking: true, logo_public_url: null }],
      }),
    ).toEqual([{ id: 'ec_1', name: 'Acme', allowOrganizationAccountLinking: true, logoPublicUrl: null }]);
  });
});
