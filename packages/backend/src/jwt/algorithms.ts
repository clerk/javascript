const RSA_ALGORITHM_NAME = 'RSASSA-PKCS1-v1_5';

const jwksAlgToCryptoAlg: Record<string, RsaHashedImportParams | Algorithm> = {
  RS256: { name: RSA_ALGORITHM_NAME, hash: { name: 'SHA-256' } },
  RS384: { name: RSA_ALGORITHM_NAME, hash: { name: 'SHA-384' } },
  RS512: { name: RSA_ALGORITHM_NAME, hash: { name: 'SHA-512' } },
  EdDSA: { name: 'Ed25519' },
};

export const algs = Object.keys(jwksAlgToCryptoAlg);

export function getCryptoAlgorithm(algorithmName: string): RsaHashedImportParams | Algorithm {
  if (!algs.includes(algorithmName)) {
    throw new Error(`Unsupported algorithm ${algorithmName}, expected one of ${algs.join(',')}.`);
  }

  return jwksAlgToCryptoAlg[algorithmName];
}
