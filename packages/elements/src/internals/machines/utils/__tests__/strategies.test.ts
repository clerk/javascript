import { matchStrategy } from '../strategies';

describe('matchStrategy', () => {
  it('should return false if either current or desired is undefined', () => {
    expect(matchStrategy(undefined, 'oauth')).toBe(false);
    expect(matchStrategy('password', undefined)).toBe(false);
    expect(matchStrategy(undefined, undefined)).toBe(false);
  });

  it('should return true if current is equal to desired', () => {
    expect(matchStrategy('password', 'password')).toBe(true);
  });

  it('should return true if current partially matches desired', () => {
    expect(matchStrategy('oauth_google', 'oauth')).toBe(true);
    expect(matchStrategy('web3_metamask_signature', 'web3')).toBe(true);
    expect(matchStrategy('web3_metamask_signature', 'web3_metamask')).toBe(true);
  });

  it('should return false on invalid partial matches', () => {
    expect(matchStrategy('oauth_google', 'web3')).toBe(false);
    expect(matchStrategy('oauth_google', 'oauth_goog')).toBe(false);
  });
});
