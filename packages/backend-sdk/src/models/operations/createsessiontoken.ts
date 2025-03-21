/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type CreateSessionTokenRequestBody = {
  /**
   * Use this parameter to override the default session token lifetime.
   */
  expiresInSeconds?: number | null | undefined;
};

export type CreateSessionTokenRequest = {
  /**
   * The ID of the session
   */
  sessionId: string;
  requestBody?: CreateSessionTokenRequestBody | undefined;
};

export const ObjectT = {
  Token: 'token',
} as const;
export type ObjectT = ClosedEnum<typeof ObjectT>;

/**
 * OK
 */
export type CreateSessionTokenResponseBody = {
  object?: ObjectT | undefined;
  jwt?: string | undefined;
};

/** @internal */
export const CreateSessionTokenRequestBody$inboundSchema: z.ZodType<
  CreateSessionTokenRequestBody,
  z.ZodTypeDef,
  unknown
> = z
  .object({
    expires_in_seconds: z.nullable(z.number()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      expires_in_seconds: 'expiresInSeconds',
    });
  });

/** @internal */
export type CreateSessionTokenRequestBody$Outbound = {
  expires_in_seconds?: number | null | undefined;
};

/** @internal */
export const CreateSessionTokenRequestBody$outboundSchema: z.ZodType<
  CreateSessionTokenRequestBody$Outbound,
  z.ZodTypeDef,
  CreateSessionTokenRequestBody
> = z
  .object({
    expiresInSeconds: z.nullable(z.number()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      expiresInSeconds: 'expires_in_seconds',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSessionTokenRequestBody$ {
  /** @deprecated use `CreateSessionTokenRequestBody$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenRequestBody$inboundSchema;
  /** @deprecated use `CreateSessionTokenRequestBody$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenRequestBody$outboundSchema;
  /** @deprecated use `CreateSessionTokenRequestBody$Outbound` instead. */
  export type Outbound = CreateSessionTokenRequestBody$Outbound;
}

export function createSessionTokenRequestBodyToJSON(
  createSessionTokenRequestBody: CreateSessionTokenRequestBody,
): string {
  return JSON.stringify(CreateSessionTokenRequestBody$outboundSchema.parse(createSessionTokenRequestBody));
}

export function createSessionTokenRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateSessionTokenRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSessionTokenRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSessionTokenRequestBody' from JSON`,
  );
}

/** @internal */
export const CreateSessionTokenRequest$inboundSchema: z.ZodType<CreateSessionTokenRequest, z.ZodTypeDef, unknown> = z
  .object({
    session_id: z.string(),
    RequestBody: z.lazy(() => CreateSessionTokenRequestBody$inboundSchema).optional(),
  })
  .transform(v => {
    return remap$(v, {
      session_id: 'sessionId',
      RequestBody: 'requestBody',
    });
  });

/** @internal */
export type CreateSessionTokenRequest$Outbound = {
  session_id: string;
  RequestBody?: CreateSessionTokenRequestBody$Outbound | undefined;
};

/** @internal */
export const CreateSessionTokenRequest$outboundSchema: z.ZodType<
  CreateSessionTokenRequest$Outbound,
  z.ZodTypeDef,
  CreateSessionTokenRequest
> = z
  .object({
    sessionId: z.string(),
    requestBody: z.lazy(() => CreateSessionTokenRequestBody$outboundSchema).optional(),
  })
  .transform(v => {
    return remap$(v, {
      sessionId: 'session_id',
      requestBody: 'RequestBody',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSessionTokenRequest$ {
  /** @deprecated use `CreateSessionTokenRequest$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenRequest$inboundSchema;
  /** @deprecated use `CreateSessionTokenRequest$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenRequest$outboundSchema;
  /** @deprecated use `CreateSessionTokenRequest$Outbound` instead. */
  export type Outbound = CreateSessionTokenRequest$Outbound;
}

export function createSessionTokenRequestToJSON(createSessionTokenRequest: CreateSessionTokenRequest): string {
  return JSON.stringify(CreateSessionTokenRequest$outboundSchema.parse(createSessionTokenRequest));
}

export function createSessionTokenRequestFromJSON(
  jsonString: string,
): SafeParseResult<CreateSessionTokenRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSessionTokenRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSessionTokenRequest' from JSON`,
  );
}

/** @internal */
export const ObjectT$inboundSchema: z.ZodNativeEnum<typeof ObjectT> = z.nativeEnum(ObjectT);

/** @internal */
export const ObjectT$outboundSchema: z.ZodNativeEnum<typeof ObjectT> = ObjectT$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ObjectT$ {
  /** @deprecated use `ObjectT$inboundSchema` instead. */
  export const inboundSchema = ObjectT$inboundSchema;
  /** @deprecated use `ObjectT$outboundSchema` instead. */
  export const outboundSchema = ObjectT$outboundSchema;
}

/** @internal */
export const CreateSessionTokenResponseBody$inboundSchema: z.ZodType<
  CreateSessionTokenResponseBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  object: ObjectT$inboundSchema.optional(),
  jwt: z.string().optional(),
});

/** @internal */
export type CreateSessionTokenResponseBody$Outbound = {
  object?: string | undefined;
  jwt?: string | undefined;
};

/** @internal */
export const CreateSessionTokenResponseBody$outboundSchema: z.ZodType<
  CreateSessionTokenResponseBody$Outbound,
  z.ZodTypeDef,
  CreateSessionTokenResponseBody
> = z.object({
  object: ObjectT$outboundSchema.optional(),
  jwt: z.string().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSessionTokenResponseBody$ {
  /** @deprecated use `CreateSessionTokenResponseBody$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenResponseBody$inboundSchema;
  /** @deprecated use `CreateSessionTokenResponseBody$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenResponseBody$outboundSchema;
  /** @deprecated use `CreateSessionTokenResponseBody$Outbound` instead. */
  export type Outbound = CreateSessionTokenResponseBody$Outbound;
}

export function createSessionTokenResponseBodyToJSON(
  createSessionTokenResponseBody: CreateSessionTokenResponseBody,
): string {
  return JSON.stringify(CreateSessionTokenResponseBody$outboundSchema.parse(createSessionTokenResponseBody));
}

export function createSessionTokenResponseBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateSessionTokenResponseBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSessionTokenResponseBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSessionTokenResponseBody' from JSON`,
  );
}
