import { describe, expect, it } from 'vitest';

import { createKeyResolver } from '../keyResolver';

describe('createKeyResolver', () => {
  it('serializes a key as prefix::tokenId::audience', () => {
    const resolver = createKeyResolver();
    expect(resolver.toKey({ tokenId: 'session_123', audience: 'aud' })).toBe('clerk::session_123::aud');
  });

  it('defaults to the clerk prefix and an empty audience segment', () => {
    const resolver = createKeyResolver();
    expect(resolver.toKey({ tokenId: 'session_123' })).toBe('clerk::session_123::');
  });

  it('coalesces empty-string and undefined audience to the same key', () => {
    const resolver = createKeyResolver();
    expect(resolver.toKey({ tokenId: 'session_123', audience: '' })).toBe(resolver.toKey({ tokenId: 'session_123' }));
  });

  it('produces distinct keys for different audiences of the same tokenId', () => {
    const resolver = createKeyResolver();
    expect(resolver.toKey({ tokenId: 'same', audience: 'a' })).not.toBe(
      resolver.toKey({ tokenId: 'same', audience: 'b' }),
    );
  });

  it('isolates an audience-scoped key from the no-audience key of the same id', () => {
    const resolver = createKeyResolver();
    expect(resolver.toKey({ tokenId: 'same', audience: 'a' })).not.toBe(resolver.toKey({ tokenId: 'same' }));
  });

  it('respects a custom prefix', () => {
    const resolver = createKeyResolver('custom');
    expect(resolver.toKey({ tokenId: 'session_123' })).toBe('custom::session_123::');
  });
});
