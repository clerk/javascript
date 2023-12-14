const algToHash: Record<string, string> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512',
};
const RSA_ALGORITHM_NAME = 'RSASSA-PKCS1-v1_5';

const jwksAlgToCryptoAlg: Record<string, string> = {
  RS256: RSA_ALGORITHM_NAME,
  RS384: RSA_ALGORITHM_NAME,
  RS512: RSA_ALGORITHM_NAME,
};

export const algs = Object.keys(algToHash);

export function getCryptoAlgorithm(algorithmName: string): RsaHashedImportParams {
  const hash = algToHash[algorithmName];
  const name = jwksAlgToCryptoAlg[algorithmName];

  if (!hash || !name) {
    throw new Error(`Unsupported algorithm ${algorithmName}, expected one of ${algs.join(',')}.`);
  }

  return {
    hash: { name: algToHash[algorithmName] },
    name: jwksAlgToCryptoAlg[algorithmName],
  };
}
