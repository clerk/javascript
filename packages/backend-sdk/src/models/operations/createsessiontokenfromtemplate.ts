/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type CreateSessionTokenFromTemplateRequestBody = {
  /**
   * Use this parameter to override the JWT token lifetime.
   */
  expiresInSeconds?: number | null | undefined;
};

export type CreateSessionTokenFromTemplateRequest = {
  /**
   * The ID of the session
   */
  sessionId: string;
  /**
   * The name of the JWT Template defined in your instance (e.g. `custom_hasura`).
   */
  templateName: string;
  requestBody?: CreateSessionTokenFromTemplateRequestBody | undefined;
};

export const CreateSessionTokenFromTemplateObject = {
  Token: 'token',
} as const;
export type CreateSessionTokenFromTemplateObject = ClosedEnum<typeof CreateSessionTokenFromTemplateObject>;

/**
 * OK
 */
export type CreateSessionTokenFromTemplateResponseBody = {
  object?: CreateSessionTokenFromTemplateObject | undefined;
  jwt?: string | undefined;
};

/** @internal */
export const CreateSessionTokenFromTemplateRequestBody$inboundSchema: z.ZodType<
  CreateSessionTokenFromTemplateRequestBody,
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
export type CreateSessionTokenFromTemplateRequestBody$Outbound = {
  expires_in_seconds?: number | null | undefined;
};

/** @internal */
export const CreateSessionTokenFromTemplateRequestBody$outboundSchema: z.ZodType<
  CreateSessionTokenFromTemplateRequestBody$Outbound,
  z.ZodTypeDef,
  CreateSessionTokenFromTemplateRequestBody
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
export namespace CreateSessionTokenFromTemplateRequestBody$ {
  /** @deprecated use `CreateSessionTokenFromTemplateRequestBody$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenFromTemplateRequestBody$inboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateRequestBody$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenFromTemplateRequestBody$outboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateRequestBody$Outbound` instead. */
  export type Outbound = CreateSessionTokenFromTemplateRequestBody$Outbound;
}

export function createSessionTokenFromTemplateRequestBodyToJSON(
  createSessionTokenFromTemplateRequestBody: CreateSessionTokenFromTemplateRequestBody,
): string {
  return JSON.stringify(
    CreateSessionTokenFromTemplateRequestBody$outboundSchema.parse(createSessionTokenFromTemplateRequestBody),
  );
}

export function createSessionTokenFromTemplateRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateSessionTokenFromTemplateRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSessionTokenFromTemplateRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSessionTokenFromTemplateRequestBody' from JSON`,
  );
}

/** @internal */
export const CreateSessionTokenFromTemplateRequest$inboundSchema: z.ZodType<
  CreateSessionTokenFromTemplateRequest,
  z.ZodTypeDef,
  unknown
> = z
  .object({
    session_id: z.string(),
    template_name: z.string(),
    RequestBody: z.lazy(() => CreateSessionTokenFromTemplateRequestBody$inboundSchema).optional(),
  })
  .transform(v => {
    return remap$(v, {
      session_id: 'sessionId',
      template_name: 'templateName',
      RequestBody: 'requestBody',
    });
  });

/** @internal */
export type CreateSessionTokenFromTemplateRequest$Outbound = {
  session_id: string;
  template_name: string;
  RequestBody?: CreateSessionTokenFromTemplateRequestBody$Outbound | undefined;
};

/** @internal */
export const CreateSessionTokenFromTemplateRequest$outboundSchema: z.ZodType<
  CreateSessionTokenFromTemplateRequest$Outbound,
  z.ZodTypeDef,
  CreateSessionTokenFromTemplateRequest
> = z
  .object({
    sessionId: z.string(),
    templateName: z.string(),
    requestBody: z.lazy(() => CreateSessionTokenFromTemplateRequestBody$outboundSchema).optional(),
  })
  .transform(v => {
    return remap$(v, {
      sessionId: 'session_id',
      templateName: 'template_name',
      requestBody: 'RequestBody',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSessionTokenFromTemplateRequest$ {
  /** @deprecated use `CreateSessionTokenFromTemplateRequest$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenFromTemplateRequest$inboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateRequest$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenFromTemplateRequest$outboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateRequest$Outbound` instead. */
  export type Outbound = CreateSessionTokenFromTemplateRequest$Outbound;
}

export function createSessionTokenFromTemplateRequestToJSON(
  createSessionTokenFromTemplateRequest: CreateSessionTokenFromTemplateRequest,
): string {
  return JSON.stringify(
    CreateSessionTokenFromTemplateRequest$outboundSchema.parse(createSessionTokenFromTemplateRequest),
  );
}

export function createSessionTokenFromTemplateRequestFromJSON(
  jsonString: string,
): SafeParseResult<CreateSessionTokenFromTemplateRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSessionTokenFromTemplateRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSessionTokenFromTemplateRequest' from JSON`,
  );
}

/** @internal */
export const CreateSessionTokenFromTemplateObject$inboundSchema: z.ZodNativeEnum<
  typeof CreateSessionTokenFromTemplateObject
> = z.nativeEnum(CreateSessionTokenFromTemplateObject);

/** @internal */
export const CreateSessionTokenFromTemplateObject$outboundSchema: z.ZodNativeEnum<
  typeof CreateSessionTokenFromTemplateObject
> = CreateSessionTokenFromTemplateObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSessionTokenFromTemplateObject$ {
  /** @deprecated use `CreateSessionTokenFromTemplateObject$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenFromTemplateObject$inboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateObject$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenFromTemplateObject$outboundSchema;
}

/** @internal */
export const CreateSessionTokenFromTemplateResponseBody$inboundSchema: z.ZodType<
  CreateSessionTokenFromTemplateResponseBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  object: CreateSessionTokenFromTemplateObject$inboundSchema.optional(),
  jwt: z.string().optional(),
});

/** @internal */
export type CreateSessionTokenFromTemplateResponseBody$Outbound = {
  object?: string | undefined;
  jwt?: string | undefined;
};

/** @internal */
export const CreateSessionTokenFromTemplateResponseBody$outboundSchema: z.ZodType<
  CreateSessionTokenFromTemplateResponseBody$Outbound,
  z.ZodTypeDef,
  CreateSessionTokenFromTemplateResponseBody
> = z.object({
  object: CreateSessionTokenFromTemplateObject$outboundSchema.optional(),
  jwt: z.string().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateSessionTokenFromTemplateResponseBody$ {
  /** @deprecated use `CreateSessionTokenFromTemplateResponseBody$inboundSchema` instead. */
  export const inboundSchema = CreateSessionTokenFromTemplateResponseBody$inboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateResponseBody$outboundSchema` instead. */
  export const outboundSchema = CreateSessionTokenFromTemplateResponseBody$outboundSchema;
  /** @deprecated use `CreateSessionTokenFromTemplateResponseBody$Outbound` instead. */
  export type Outbound = CreateSessionTokenFromTemplateResponseBody$Outbound;
}

export function createSessionTokenFromTemplateResponseBodyToJSON(
  createSessionTokenFromTemplateResponseBody: CreateSessionTokenFromTemplateResponseBody,
): string {
  return JSON.stringify(
    CreateSessionTokenFromTemplateResponseBody$outboundSchema.parse(createSessionTokenFromTemplateResponseBody),
  );
}

export function createSessionTokenFromTemplateResponseBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateSessionTokenFromTemplateResponseBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateSessionTokenFromTemplateResponseBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateSessionTokenFromTemplateResponseBody' from JSON`,
  );
}
