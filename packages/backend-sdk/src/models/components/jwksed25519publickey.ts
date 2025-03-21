/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export const Kty = {
  Okp: 'OKP',
} as const;
export type Kty = ClosedEnum<typeof Kty>;

export const Crv = {
  Ed25519: 'Ed25519',
} as const;
export type Crv = ClosedEnum<typeof Crv>;

export type JWKSEd25519PublicKey = {
  kid: string;
  alg: string;
  use: string;
  kty: Kty;
  crv: Crv;
  x: string;
  x5c?: Array<string> | undefined;
  x5t?: string | undefined;
  x5tNumberS256?: string | undefined;
  x5u?: string | undefined;
};

/** @internal */
export const Kty$inboundSchema: z.ZodNativeEnum<typeof Kty> = z.nativeEnum(Kty);

/** @internal */
export const Kty$outboundSchema: z.ZodNativeEnum<typeof Kty> = Kty$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Kty$ {
  /** @deprecated use `Kty$inboundSchema` instead. */
  export const inboundSchema = Kty$inboundSchema;
  /** @deprecated use `Kty$outboundSchema` instead. */
  export const outboundSchema = Kty$outboundSchema;
}

/** @internal */
export const Crv$inboundSchema: z.ZodNativeEnum<typeof Crv> = z.nativeEnum(Crv);

/** @internal */
export const Crv$outboundSchema: z.ZodNativeEnum<typeof Crv> = Crv$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Crv$ {
  /** @deprecated use `Crv$inboundSchema` instead. */
  export const inboundSchema = Crv$inboundSchema;
  /** @deprecated use `Crv$outboundSchema` instead. */
  export const outboundSchema = Crv$outboundSchema;
}

/** @internal */
export const JWKSEd25519PublicKey$inboundSchema: z.ZodType<JWKSEd25519PublicKey, z.ZodTypeDef, unknown> = z
  .object({
    kid: z.string(),
    alg: z.string(),
    use: z.string(),
    kty: Kty$inboundSchema,
    crv: Crv$inboundSchema,
    x: z.string(),
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
export type JWKSEd25519PublicKey$Outbound = {
  kid: string;
  alg: string;
  use: string;
  kty: string;
  crv: string;
  x: string;
  x5c?: Array<string> | undefined;
  x5t?: string | undefined;
  'x5t#S256'?: string | undefined;
  x5u?: string | undefined;
};

/** @internal */
export const JWKSEd25519PublicKey$outboundSchema: z.ZodType<
  JWKSEd25519PublicKey$Outbound,
  z.ZodTypeDef,
  JWKSEd25519PublicKey
> = z
  .object({
    kid: z.string(),
    alg: z.string(),
    use: z.string(),
    kty: Kty$outboundSchema,
    crv: Crv$outboundSchema,
    x: z.string(),
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
export namespace JWKSEd25519PublicKey$ {
  /** @deprecated use `JWKSEd25519PublicKey$inboundSchema` instead. */
  export const inboundSchema = JWKSEd25519PublicKey$inboundSchema;
  /** @deprecated use `JWKSEd25519PublicKey$outboundSchema` instead. */
  export const outboundSchema = JWKSEd25519PublicKey$outboundSchema;
  /** @deprecated use `JWKSEd25519PublicKey$Outbound` instead. */
  export type Outbound = JWKSEd25519PublicKey$Outbound;
}

export function jwksEd25519PublicKeyToJSON(jwksEd25519PublicKey: JWKSEd25519PublicKey): string {
  return JSON.stringify(JWKSEd25519PublicKey$outboundSchema.parse(jwksEd25519PublicKey));
}

export function jwksEd25519PublicKeyFromJSON(
  jsonString: string,
): SafeParseResult<JWKSEd25519PublicKey, SDKValidationError> {
  return safeParse(
    jsonString,
    x => JWKSEd25519PublicKey$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'JWKSEd25519PublicKey' from JSON`,
  );
}
