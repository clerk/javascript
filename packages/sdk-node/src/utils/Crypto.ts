import { Crypto, CryptoKey } from '@peculiar/webcrypto';

import { decodeBase64, str2ab } from './Encoding';

export const crypto = new Crypto();

// toSPKIDer converts a PEM encoded Public Key to DER encoded
export function toSPKIDer(pem: string): ArrayBuffer {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  );
  const binaryDerString = decodeBase64(pemContents);
  return str2ab(binaryDerString);
}

export async function importPKIKey(publicKey: string) {
  return crypto.subtle.importKey(
    'spki',
    toSPKIDer(publicKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    true,
    ['verify']
  );
}

export async function importJSONWebKey(jwk: JsonWebKey, algorithm: Algorithm) {
  return await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);
}

export async function verifySignature(
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
) {
  return crypto.subtle.verify(algorithm, key, signature, data);
}
