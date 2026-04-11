import { describe, expect, it } from 'vitest';

import { readOAuthConsentFromSearch } from '../useOAuthConsent.shared';

describe('readOAuthConsentFromSearch', () => {
  it('parses client_id and scope from a location.search-style string', () => {
    expect(readOAuthConsentFromSearch('?client_id=myapp&scope=openid%20email')).toEqual({
      oauthClientId: 'myapp',
      scope: 'openid email',
    });
  });

  it('parses without a leading question mark', () => {
    expect(readOAuthConsentFromSearch('client_id=x&scope=y')).toEqual({
      oauthClientId: 'x',
      scope: 'y',
    });
  });

  it('returns empty client id and undefined scope when search is empty', () => {
    expect(readOAuthConsentFromSearch('')).toEqual({
      oauthClientId: '',
    });
  });

  it('omits scope in the result when scope is absent', () => {
    expect(readOAuthConsentFromSearch('?client_id=only')).toEqual({
      oauthClientId: 'only',
    });
  });
});
