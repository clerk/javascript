import { SignJWTError } from '../errors';
import { runtime } from '../runtime';
import { base64url } from '../util/rfc4648';
import { getCryptoAlgorithm } from './algorithms';
import { importKey } from './cryptoKeys';
import type { JwtReturnType } from './types';

export interface SignJwtOptions {
  algorithm?: string;
  header?: Record<string, unknown>;
}

function encodeJwtData(value: unknown): string {
  const stringified = JSON.stringify(value);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(stringified);
  return base64url.stringify(encoded, { pad: false });
}

/**
 * Signs a JSON Web Token (JWT) with the given payload, key, and options.
 * This function is intended to be used *internally* by other Clerk packages and typically
 * should not be used directly.
 *
 * @internal
 * @param payload The payload to include in the JWT.
 * @param key The key to use for signing the JWT. Can be a string or a JsonWebKey.
 * @param options The options to use for signing the JWT.
 * @returns A Promise that resolves to the signed JWT string.
 * @throws An error if no algorithm is specified or if the specified algorithm is unsupported.
 * @throws An error if there is an issue with importing the key or signing the JWT.
 */
export async function signJwt(
  payload: Record<string, unknown>,
  key: string | JsonWebKey,
  options: SignJwtOptions,
): Promise<JwtReturnType<string, Error>> {
  if (!options.algorithm) {
    throw new Error('No algorithm specified');
  }
  const encoder = new TextEncoder();

  const algorithm = getCryptoAlgorithm(options.algorithm);
  if (!algorithm) {
    return {
      errors: [new SignJWTError(`Unsupported algorithm ${options.algorithm}`)],
    };
  }

  const cryptoKey = await importKey(key, algorithm, 'sign');
  const header = options.header || { typ: 'JWT' };

  header.alg = options.algorithm;
  payload.iat = Math.floor(Date.now() / 1000);

  const encodedHeader = encodeJwtData(header);
  const encodedPayload = encodeJwtData(payload);
  const firstPart = `${encodedHeader}.${encodedPayload}`;

  try {
    const signature = await runtime.crypto.subtle.sign(algorithm, cryptoKey, encoder.encode(firstPart));
    const encodedSignature = `${firstPart}.${base64url.stringify(new Uint8Array(signature), { pad: false })}`;
    return { data: encodedSignature };
  } catch (error) {
    return { errors: [new SignJWTError((error as Error)?.message)] };
  }
}
