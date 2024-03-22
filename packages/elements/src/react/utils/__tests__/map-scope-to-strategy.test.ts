import { mapScopeToStrategy } from '../map-scope-to-strategy';

describe('mapScopeToStrategy', () => {
  test('should return web3_metamask_signature for scope "provider:metamask"', () => {
    const scope = 'provider:metamask';
    const strategy = mapScopeToStrategy(scope);
    expect(strategy).toBe('web3_metamask_signature');
  });

  test('should return saml for scope "provider:saml"', () => {
    const scope = 'provider:saml';
    const strategy = mapScopeToStrategy(scope);
    expect(strategy).toBe('saml');
  });

  test('should return oauth_{provider} for other scopes', () => {
    const scope = 'provider:google';
    const strategy = mapScopeToStrategy(scope);
    expect(strategy).toBe('oauth_google');
  });
});
