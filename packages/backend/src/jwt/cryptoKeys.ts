import { isomorphicAtob } from '@clerk/shared/isomorphicAtob';

import { runtime } from '../runtime';

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8_import
function pemToBuffer(secret: string): ArrayBuffer {
  const trimmed = secret
    .replace(/-----BEGIN.*?-----/g, '')
    .replace(/-----END.*?-----/g, '')
    .replace(/\s/g, '');

  const decoded = isomorphicAtob(trimmed);

  const buffer = new ArrayBuffer(decoded.length);
  const bufView = new Uint8Array(buffer);

  for (let i = 0, strLen = decoded.length; i < strLen; i++) {
    bufView[i] = decoded.charCodeAt(i);
  }

  return bufView;
}

export function importKey(
  key: JsonWebKey | string,
  algorithm: RsaHashedImportParams,
  keyUsage: 'verify' | 'sign',
): Promise<CryptoKey> {
  if (typeof key === 'object') {
    return runtime.crypto.subtle.importKey('jwk', key, algorithm, false, [keyUsage]);
  }

  const keyData = pemToBuffer(key);
  const format = keyUsage === 'sign' ? 'pkcs8' : 'spki';

  return runtime.crypto.subtle.importKey(format, keyData, algorithm, false, [keyUsage]);
}
