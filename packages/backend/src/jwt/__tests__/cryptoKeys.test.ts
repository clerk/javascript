import { describe, expect, it } from 'vitest';

import { pemEncodedPublicKey, pemEncodedSignKey, publicJwks, signingJwks } from '../../fixtures';
import { importKey } from '../cryptoKeys';

describe('importKey(key, options)', () => {
  const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

  it('imports a JWK formatted private key', async () => {
    expect(await importKey(signingJwks, algorithm, 'sign')).toBeTruthy();
  });

  it('imports a JWK formatted public key', async () => {
    expect(await importKey(publicJwks, algorithm, 'verify')).toBeTruthy();
  });

  it('imports a pkcs8 formatted secret for signing', async () => {
    expect(await importKey(pemEncodedSignKey, algorithm, 'sign')).toBeTruthy();
  });

  it('imports a pkcs8 formatted secret for verification', async () => {
    expect(await importKey(pemEncodedPublicKey, algorithm, 'verify')).toBeTruthy();
  });

  it('throws an error if the key is a string and not pem formatted', async () => {
    await expect(importKey('not a key', algorithm, 'sign')).rejects.toThrow();
  });

  it('throws an error if the key is not a JWK', async () => {
    await expect(importKey({} as JsonWebKey, algorithm, 'sign')).rejects.toThrow();
  });

  it('throws an error if a public key is imported for signing', async () => {
    await expect(importKey(pemEncodedPublicKey, algorithm, 'sign')).rejects.toThrow();
  });

  it('throws an error if a private key is imported for verification', async () => {
    await expect(importKey(pemEncodedSignKey, algorithm, 'verify')).rejects.toThrow();
  });
});
