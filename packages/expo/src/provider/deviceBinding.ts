import { isomorphicAtob } from '@clerk/shared/isomorphicAtob';

import type { NativeDeviceBindingModule } from '../specs/NativeClerkModule.types';

const DPOP_HEADER = 'DPoP';
const AUTHORIZATION_HEADER = 'authorization';
const DATE_HEADER = 'date';
const UNAUTHORIZED = 401;

const REFETCH_WITH_A_NEW_PROOF = new Set(['device_binding_proof_invalid', 'device_binding_proof_replayed']);
const BOUND_ELSEWHERE = new Set(['device_binding_proof_missing', 'device_binding_key_mismatch']);

/** One fetch of a Frontend API request, as clerk-js's per-attempt hooks see it. */
export type FetchAttempt = {
  url: URL;
  method: 'GET' | 'POST';
  headers: Headers;
  attempt: number;
};

type FapiResponseLike = {
  status: number;
  payload: { errors?: Array<{ code: string }> } | null;
};

export type DeviceBinding = {
  /**
   * Sets this attempt's `DPoP` header whenever the native SDK signs it, whatever the token, since a request
   * may replace its client. Rejects only when a bound token's proof cannot be signed.
   */
  beforeFetch: (attempt: FetchAttempt) => Promise<void>;
  /** Resolves true when the attempt should be fetched once more with a new proof. */
  onFetchResponse: (attempt: FetchAttempt, response: Response) => Promise<boolean>;
  /** Drops a token that the response says is bound to a key this device does not hold. */
  afterResponse: (requestToken: string | null, response: FapiResponseLike) => Promise<void>;
};

/** Returns the claims of a JWT's payload, or null when it does not decode. */
export function jwtClaims(token: string | null | undefined): Record<string, unknown> | null {
  const payload = token?.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims: unknown = JSON.parse(isomorphicAtob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return claims && typeof claims === 'object' ? (claims as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function isDeviceBound(token: string): boolean {
  const claims = jwtClaims(token);
  return !!claims && 'cnf' in claims;
}

async function errorCodes(response: Response): Promise<string[]> {
  try {
    const body = (await response.clone().json()) as FapiResponseLike['payload'];
    return body?.errors?.map(error => error.code) ?? [];
  } catch {
    return [];
  }
}

/**
 * Signs clerk-js's Frontend API requests with the native SDK's device key and recovers from the
 * server's device binding errors the way the native SDKs do.
 */
export function createDeviceBinding(
  native: NativeDeviceBindingModule,
  dropClientToken: (requestToken: string) => Promise<void>,
): DeviceBinding {
  return {
    beforeFetch: async ({ url, method, headers }) => {
      const token = headers.get(AUTHORIZATION_HEADER) || null;
      let proof: string | null;
      try {
        proof = await native.createDpopProof(method, url.toString(), token);
      } catch (error) {
        if (token && isDeviceBound(token)) {
          throw error;
        }
        return;
      }
      if (proof) {
        headers.set(DPOP_HEADER, proof);
      }
    },

    onFetchResponse: async ({ headers }, response) => {
      const date = response.headers.get(DATE_HEADER);
      if (date) {
        native.recordServerDate(date);
      }
      if (response.status !== UNAUTHORIZED || !headers.has(DPOP_HEADER)) {
        return false;
      }
      return (await errorCodes(response)).some(code => REFETCH_WITH_A_NEW_PROOF.has(code));
    },

    afterResponse: async (requestToken, response) => {
      if (response.status !== UNAUTHORIZED || !requestToken) {
        return;
      }
      if (response.payload?.errors?.some(error => BOUND_ELSEWHERE.has(error.code))) {
        await dropClientToken(requestToken);
      }
    },
  };
}
