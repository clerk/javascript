import { describe, expect, it } from 'vitest';

import { generateCodeChallenge, generateCodeVerifier, generateState } from '../lib/pkce';

describe('pkce', () => {
  it('generates a 43 character base64url verifier', () => {
    const verifier = generateCodeVerifier();

    expect(verifier).toHaveLength(43);
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates the RFC 7636 S256 challenge vector', async () => {
    await expect(generateCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).resolves.toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });

  it('generates unique state values', () => {
    const states = new Set(Array.from({ length: 100 }, () => generateState()));

    expect(states.size).toBe(100);
    for (const state of states) {
      expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});
