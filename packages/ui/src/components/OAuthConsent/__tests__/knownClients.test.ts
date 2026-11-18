import { describe, expect, it } from 'vitest';

import { getKnownOAuthClient } from '../knownClients';

describe('getKnownOAuthClient', () => {
  it('resolves Claude from its registrable domains', () => {
    expect(getKnownOAuthClient('claude.ai')?.name).toBe('Claude');
    expect(getKnownOAuthClient('claude.com')?.name).toBe('Claude');
    expect(getKnownOAuthClient('anthropic.com')?.name).toBe('Claude');
  });

  it('resolves ChatGPT from its registrable domains', () => {
    expect(getKnownOAuthClient('chatgpt.com')?.name).toBe('ChatGPT');
    expect(getKnownOAuthClient('openai.com')?.name).toBe('ChatGPT');
  });

  it('is case-insensitive and trims surrounding whitespace', () => {
    expect(getKnownOAuthClient('  Claude.AI  ')?.name).toBe('Claude');
  });

  it('returns undefined for empty, nullish, or unknown domains', () => {
    expect(getKnownOAuthClient('')).toBeUndefined();
    expect(getKnownOAuthClient(null)).toBeUndefined();
    expect(getKnownOAuthClient(undefined)).toBeUndefined();
    expect(getKnownOAuthClient('example.com')).toBeUndefined();
  });

  it('does not match a subdomain string that is not the registrable domain', () => {
    // Matching is exact on the PSL-resolved registrable domain, so a look-alike
    // host must not borrow the branding.
    expect(getKnownOAuthClient('claude.ai.evil.com')).toBeUndefined();
    expect(getKnownOAuthClient('notclaude.ai')).toBeUndefined();
  });

  it('provides an icon component for matched clients', () => {
    expect(getKnownOAuthClient('claude.ai')?.icon).toBeDefined();
    expect(getKnownOAuthClient('chatgpt.com')?.icon).toBeDefined();
  });
});
