/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export const JWKSRsaPrivateKeyKty = {
  Rsa: 'RSA',
} as const;
export type JWKSRsaPrivateKeyKty = ClosedEnum<typeof JWKSRsaPrivateKeyKty>;

export type JWKSRsaPrivateKey = {
  kid: string;
  alg: string;
  use: string;
  kty: JWKSRsaPrivateKeyKty;
  n: string;
  e: string;
  d: string;
  p: string;
  q: string;
  dp?: string | undefined;
  dq?: string | undefined;
  qi?: string | undefined;
  x5c?: Array<string> | undefined;
  x5t?: string | undefined;
  x5tNumberS256?: string | undefined;
  x5u?: string | undefined;
};

/** @internal */
export const JWKSRsaPrivateKeyKty$inboundSchema: z.ZodNativeEnum<typeof JWKSRsaPrivateKeyKty> =
  z.nativeEnum(JWKSRsaPrivateKeyKty);

/** @internal */
export const JWKSRsaPrivateKeyKty$outboundSchema: z.ZodNativeEnum<typeof JWKSRsaPrivateKeyKty> =
  JWKSRsaPrivateKeyKty$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace JWKSRsaPrivateKeyKty$ {
  /** @deprecated use `JWKSRsaPrivateKeyKty$inboundSchema` instead. */
  export const inboundSchema = JWKSRsaPrivateKeyKty$inboundSchema;
  /** @deprecated use `JWKSRsaPrivateKeyKty$outboundSchema` instead. */
  export const outboundSchema = JWKSRsaPrivateKeyKty$outboundSchema;
}

/** @internal */
export const JWKSRsaPrivateKey$inboundSchema: z.ZodType<JWKSRsaPrivateKey, z.ZodTypeDef, unknown> = z
  .object({
    kid: z.string(),
    alg: z.string(),
    use: z.string(),
    kty: JWKSRsaPrivateKeyKty$inboundSchema,
    n: z.string(),
    e: z.string(),
    d: z.string(),
    p: z.string(),
    q: z.string(),
    dp: z.string().optional(),
    dq: z.string().optional(),
    qi: z.string().optional(),
    x5c: z.array(z.string()).optional(),
    x5t: z.string().optional(),
    'x5t#S256': z.string().optional(),
    x5u: z.string().optional(),
  })
  .transform(v => {
    return remap$(v, {
      'x5t#S256': 'x5tNumberS256',
    });
  });

/** @internal */
export type JWKSRsaPrivateKey$Outbound = {
  kid: string;
  alg: string;
  use: string;
  kty: string;
  n: string;
  e: string;
  d: string;
  p: string;
  q: string;
  dp?: string | undefined;
  dq?: string | undefined;
  qi?: string | undefined;
  x5c?: Array<string> | undefined;
  x5t?: string | undefined;
  'x5t#S256'?: string | undefined;
  x5u?: string | undefined;
};

/** @internal */
export const JWKSRsaPrivateKey$outboundSchema: z.ZodType<JWKSRsaPrivateKey$Outbound, z.ZodTypeDef, JWKSRsaPrivateKey> =
  z
    .object({
      kid: z.string(),
      alg: z.string(),
      use: z.string(),
      kty: JWKSRsaPrivateKeyKty$outboundSchema,
      n: z.string(),
      e: z.string(),
      d: z.string(),
      p: z.string(),
      q: z.string(),
      dp: z.string().optional(),
      dq: z.string().optional(),
      qi: z.string().optional(),
      x5c: z.array(z.string()).optional(),
      x5t: z.string().optional(),
      x5tNumberS256: z.string().optional(),
      x5u: z.string().optional(),
    })
    .transform(v => {
      return remap$(v, {
        x5tNumberS256: 'x5t#S256',
      });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace JWKSRsaPrivateKey$ {
  /** @deprecated use `JWKSRsaPrivateKey$inboundSchema` instead. */
  export const inboundSchema = JWKSRsaPrivateKey$inboundSchema;
  /** @deprecated use `JWKSRsaPrivateKey$outboundSchema` instead. */
  export const outboundSchema = JWKSRsaPrivateKey$outboundSchema;
  /** @deprecated use `JWKSRsaPrivateKey$Outbound` instead. */
  export type Outbound = JWKSRsaPrivateKey$Outbound;
}

export function jwksRsaPrivateKeyToJSON(jwksRsaPrivateKey: JWKSRsaPrivateKey): string {
  return JSON.stringify(JWKSRsaPrivateKey$outboundSchema.parse(jwksRsaPrivateKey));
}

export function jwksRsaPrivateKeyFromJSON(jsonString: string): SafeParseResult<JWKSRsaPrivateKey, SDKValidationError> {
  return safeParse(
    jsonString,
    x => JWKSRsaPrivateKey$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'JWKSRsaPrivateKey' from JSON`,
  );
}
