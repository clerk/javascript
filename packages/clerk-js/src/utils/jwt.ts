import type { JWT, JwtPayload } from '@clerk/shared/types';

import { urlDecodeB64 } from './encoders';

export function decode(token: string): JWT {
  const parts = (token || '').split('.');
  const [header, payload, signature] = parts;

  if (parts.length !== 3 || !header || !payload || !signature) {
    throw new Error('JWT could not be decoded');
  }

  const payloadJSON = JSON.parse(urlDecodeB64(payload));
  const claims = { __raw: token } as JwtPayload;

  Object.keys(payloadJSON).forEach(k => {
    claims[k] = payloadJSON[k];
  });

  const decodedToken = {
    encoded: { header, payload, signature },
    header: JSON.parse(urlDecodeB64(header)),
    claims,
  };

  return decodedToken;
}
