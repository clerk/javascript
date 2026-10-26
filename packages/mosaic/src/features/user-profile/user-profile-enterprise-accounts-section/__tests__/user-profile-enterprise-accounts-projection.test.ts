import { describe, expect, it } from 'vitest';

import { projectEnterpriseAccounts } from '../user-profile-enterprise-accounts-section.model';

describe('projectEnterpriseAccounts', () => {
  const connection = (id: string, allowOrganizationAccountLinking = true) => ({
    id,
    provider: 'saml_okta' as const,
    name: id,
    allowOrganizationAccountLinking,
  });
  const account = (id: string, enterpriseConnectionId: string, active = true, error?: string) => ({
    id,
    provider: 'saml_okta' as const,
    emailAddress: `${id}@example.com`,
    enterpriseConnectionId,
    verification: error ? { error: { longMessage: error } } : null,
    enterpriseConnection: { active, name: enterpriseConnectionId, logoPublicUrl: null },
  });

  it.each([
    ['saml_okta', true],
    ['oauth_github', true],
    ['saml_google', false],
    ['saml_custom', false],
  ] as const)('projects %s icon treatment for linked and available accounts', (provider, monochromeIcon) => {
    const linked = account('ent_linked', 'linked');
    const projection = projectEnterpriseAccounts({
      enabled: true,
      accounts: [
        {
          ...linked,
          provider,
        },
      ],
      connections: [{ ...connection('available'), provider }],
    });

    expect(projection).toMatchObject({
      status: 'ready',
      accounts: [{ monochromeIcon }],
      connections: [{ monochromeIcon }],
    });
  });

  it('hides the section when enterprise SSO is disabled', () => {
    expect(projectEnterpriseAccounts({ enabled: false, accounts: [], connections: [connection('okta')] })).toEqual({
      status: 'hidden',
    });
  });

  it('hides the section when there is nothing to show', () => {
    expect(
      projectEnterpriseAccounts({ enabled: true, accounts: [], connections: [connection('saml', false)] }),
    ).toEqual({ status: 'hidden' });
  });

  it('shows active accounts and offers only unlinked, linkable connections', () => {
    const projection = projectEnterpriseAccounts({
      enabled: true,
      accounts: [account('ent_okta', 'okta'), account('ent_old', 'old', false)],
      connections: [connection('okta'), connection('azure'), connection('saml', false)],
    });
    expect(projection.status === 'ready' && projection.accounts.map(a => a.id)).toEqual(['ent_okta']);
    expect(projection.status === 'ready' && projection.connections.map(c => c.id)).toEqual(['azure']);
  });

  it('flags accounts whose verification failed', () => {
    const projection = projectEnterpriseAccounts({
      enabled: true,
      accounts: [account('ent_okta', 'okta', true, 'Verification failed')],
      connections: [],
    });
    expect(projection.status === 'ready' && projection.accounts[0]?.requiresAction).toBe(true);
  });
});
