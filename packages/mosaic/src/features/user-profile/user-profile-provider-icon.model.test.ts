import { describe, expect, it } from 'vitest';

import { enterpriseLogos } from '../../components/provider-logo/enterprise.generated';
import { oauthLogos } from '../../components/provider-logo/oauth.generated';
import { toManagedBy } from './user-profile-managed-by.model';
import { toProviderIcon } from './user-profile-provider-icon.model';

describe('toProviderIcon', () => {
  it('prefers the bundled logo over an image URL', () => {
    expect(toProviderIcon({ logo: oauthLogos.google, iconUrl: 'https://example.com/logo.png', label: 'Acme' })).toEqual(
      { logo: oauthLogos.google },
    );
  });

  it('falls back to the image URL without a bundled logo', () => {
    expect(toProviderIcon({ iconUrl: ' https://example.com/logo.png ', label: 'Acme' })).toEqual({
      iconUrl: 'https://example.com/logo.png',
    });
  });

  it('falls back to the initial when there is no logo or image', () => {
    expect(toProviderIcon({ iconUrl: null, label: ' acme SSO' })).toEqual({ initial: 'A' });
  });
});

describe('toManagedBy', () => {
  it('names the connection and carries its bundled enterprise logo', () => {
    expect(toManagedBy({ provider: 'oidc_gitlab', enterpriseConnection: { name: 'Acme GitLab' } })).toEqual({
      name: 'Acme GitLab',
      logo: enterpriseLogos.oidc_gitlab,
    });
  });

  it('leaves out a missing name and a logo it does not bundle', () => {
    expect(toManagedBy({ provider: 'saml_custom', enterpriseConnection: null })).toEqual({});
  });
});
