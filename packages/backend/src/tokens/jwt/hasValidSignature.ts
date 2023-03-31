import type { Jwt } from '@clerk/types';

// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../../runtime';

const algToHash: Record<string, string> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512',
  ES256: 'SHA-256',
  ES384: 'SHA-384',
  ES512: 'SHA-512',
};

const RSA_ALGORITHM_NAME = 'RSASSA-PKCS1-v1_5';
const EC_ALGORITHM_NAME = 'ECDSA';

const jwksAlgToCryptoAlg: Record<string, string> = {
  RS256: RSA_ALGORITHM_NAME,
  RS384: RSA_ALGORITHM_NAME,
  RS512: RSA_ALGORITHM_NAME,
  ES256: EC_ALGORITHM_NAME,
  ES384: EC_ALGORITHM_NAME,
  ES512: EC_ALGORITHM_NAME,
};

export async function hasValidSignature(jwt: Jwt, jwk: JsonWebKey) {
  const { header, signature, raw } = jwt;
  const encoder = new TextEncoder();
  const data = encoder.encode([raw.header, raw.payload].join('.'));

  const cryptoKey = await runtime.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: jwksAlgToCryptoAlg[header.alg],
      hash: algToHash[header.alg],
    },
    false,
    ['verify'],
  );

  return runtime.crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, data);
}
