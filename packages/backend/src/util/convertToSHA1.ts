import { convertUint8ArrayToHex } from '@clerk/shared';

import runtime from '../runtime';

export async function convertToSHA1(data: Uint8Array) {
  const buffer = await runtime.crypto.subtle.digest('SHA-1', data);

  const hash = Array.from(new Uint8Array(buffer));
  return convertUint8ArrayToHex(hash);
}
