import { describe, expect, it } from 'vitest';

import { toManagedBy } from './user-profile-managed-by.model';
import { toProviderIcon } from './user-profile-provider-icon.model';

describe('toProviderIcon', () => {
  it.each(['google', 'oauth_google', 'saml_okta', 'oidc_gitlab'])('uses the bundled logo for %s', provider => {
    expect(toProviderIcon({ provider, iconUrl: 'https://example.com/logo.png', label: 'Acme' })).toEqual({
      logo: provider.replace(/^(oauth_|saml_|oidc_)/, ''),
    });
  });

  it('falls back to the image URL for a provider without a bundled logo', () => {
    expect(
      toProviderIcon({ provider: 'saml_custom', iconUrl: ' https://example.com/logo.png ', label: 'Acme' }),
    ).toEqual({ iconUrl: 'https://example.com/logo.png' });
  });

  it('falls back to the initial when there is no logo or image', () => {
    expect(toProviderIcon({ provider: 'oidc_custom', iconUrl: null, label: ' acme SSO' })).toEqual({ initial: 'A' });
  });
});

describe('toManagedBy', () => {
  it('names the connection and carries its bundled logo', () => {
    expect(toManagedBy({ provider: 'oidc_gitlab', enterpriseConnection: { name: 'Acme GitLab' } })).toEqual({
      name: 'Acme GitLab',
      provider: 'gitlab',
    });
  });

  it('leaves out a missing name and a logo it does not bundle', () => {
    expect(toManagedBy({ provider: 'saml_custom', enterpriseConnection: null })).toEqual({});
  });
});
