/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type CreateSignInTokenRequestBody = {
  /**
   * The ID of the user that can use the newly created sign in token
   */
  userId: string;
  /**
   * Optional parameter to specify the life duration of the sign in token in seconds.
   *
   * @remarks
   * By default, the duration is 30 days.
   */
  expiresInSeconds?: number | null | undefined;
};

/** @internal */
export const CreateSignInTokenRequestBody$inboundSchema: z.ZodType<
  CreateSignInTokenRequestBody,
  z.ZodTypeDef,
  unknown
> = z
  .object({
    user_id: z.string(),
    expires_in_seconds: z.nullable(z.number().int().default(2592000)),
  })
  .transform(v => {
    return remap$(v, {
      user_id: 'userId',
      expires_in_seconds: 'expiresInSeconds',
    });
  });

/** @internal */
export type CreateSignInTokenRequestBody$Outbound = {
  user_id: string;
  expires_in_seconds: number | null;
};

/** @internal */
export const CreateSignInTokenRequestBody$outboundSchema: z.ZodType<
  CreateSignInTokenRequestBody$Outbound,
  z.ZodTypeDef,
  CreateSignInTokenRequestBody
> = z
  .object({
    userId: z.string(),
    expiresInSeconds: z.nullable(z.number().int().default(2592000)),
  })
  .transform(v => {
    return remap$(v, {
      userId: 'user_id',
      expiresInSeconds: 'expires_in_seconds',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSignInTokenRequestBody$ {
  /** @deprecated use `CreateSignInTokenRequestBody$inboundSchema` instead. */
  export const inboundSchema = CreateSignInTokenRequestBody$inboundSchema;
  /** @deprecated use `CreateSignInTokenRequestBody$outboundSchema` instead. */
  export const outboundSchema = CreateSignInTokenRequestBody$outboundSchema;
  /** @deprecated use `CreateSignInTokenRequestBody$Outbound` instead. */
  export type Outbound = CreateSignInTokenRequestBody$Outbound;
}

export function createSignInTokenRequestBodyToJSON(createSignInTokenRequestBody: CreateSignInTokenRequestBody): string {
  return JSON.stringify(CreateSignInTokenRequestBody$outboundSchema.parse(createSignInTokenRequestBody));
}

export function createSignInTokenRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateSignInTokenRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSignInTokenRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSignInTokenRequestBody' from JSON`,
  );
}
