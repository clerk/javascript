/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

/**
 * The type of template to update
 */
export const UpsertTemplatePathParamTemplateType = {
  Email: 'email',
  Sms: 'sms',
} as const;
/**
 * The type of template to update
 */
export type UpsertTemplatePathParamTemplateType = ClosedEnum<typeof UpsertTemplatePathParamTemplateType>;

export type UpsertTemplateRequestBody = {
  /**
   * The user-friendly name of the template
   */
  name?: string | undefined;
  /**
   * The email subject.
   *
   * @remarks
   * Applicable only to email templates.
   */
  subject?: string | null | undefined;
  /**
   * The editor markup used to generate the body of the template
   */
  markup?: string | null | undefined;
  /**
   * The template body before variable interpolation
   */
  body?: string | undefined;
  /**
   * Whether Clerk should deliver emails or SMS messages based on the current template
   */
  deliveredByClerk?: boolean | null | undefined;
  /**
   * The local part of the From email address that will be used for emails.
   *
   * @remarks
   * For example, in the address 'hello@example.com', the local part is 'hello'.
   * Applicable only to email templates.
   */
  fromEmailName?: string | undefined;
  /**
   * The local part of the Reply To email address that will be used for emails.
   *
   * @remarks
   * For example, in the address 'hello@example.com', the local part is 'hello'.
   * Applicable only to email templates.
   */
  replyToEmailName?: string | undefined;
};

export type UpsertTemplateRequest = {
  /**
   * The type of template to update
   */
  templateType: UpsertTemplatePathParamTemplateType;
  /**
   * The slug of the template to update
   */
  slug: string;
  requestBody?: UpsertTemplateRequestBody | undefined;
};

/** @internal */
export const UpsertTemplatePathParamTemplateType$inboundSchema: z.ZodNativeEnum<
  typeof UpsertTemplatePathParamTemplateType
> = z.nativeEnum(UpsertTemplatePathParamTemplateType);

/** @internal */
export const UpsertTemplatePathParamTemplateType$outboundSchema: z.ZodNativeEnum<
  typeof UpsertTemplatePathParamTemplateType
> = UpsertTemplatePathParamTemplateType$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpsertTemplatePathParamTemplateType$ {
  /** @deprecated use `UpsertTemplatePathParamTemplateType$inboundSchema` instead. */
  export const inboundSchema = UpsertTemplatePathParamTemplateType$inboundSchema;
  /** @deprecated use `UpsertTemplatePathParamTemplateType$outboundSchema` instead. */
  export const outboundSchema = UpsertTemplatePathParamTemplateType$outboundSchema;
}

/** @internal */
export const UpsertTemplateRequestBody$inboundSchema: z.ZodType<UpsertTemplateRequestBody, z.ZodTypeDef, unknown> = z
  .object({
    name: z.string().optional(),
    subject: z.nullable(z.string()).optional(),
    markup: z.nullable(z.string()).optional(),
    body: z.string().optional(),
    delivered_by_clerk: z.nullable(z.boolean()).optional(),
    from_email_name: z.string().optional(),
    reply_to_email_name: z.string().optional(),
  })
  .transform(v => {
    return remap$(v, {
      delivered_by_clerk: 'deliveredByClerk',
      from_email_name: 'fromEmailName',
      reply_to_email_name: 'replyToEmailName',
    });
  });

/** @internal */
export type UpsertTemplateRequestBody$Outbound = {
  name?: string | undefined;
  subject?: string | null | undefined;
  markup?: string | null | undefined;
  body?: string | undefined;
  delivered_by_clerk?: boolean | null | undefined;
  from_email_name?: string | undefined;
  reply_to_email_name?: string | undefined;
};

/** @internal */
export const UpsertTemplateRequestBody$outboundSchema: z.ZodType<
  UpsertTemplateRequestBody$Outbound,
  z.ZodTypeDef,
  UpsertTemplateRequestBody
> = z
  .object({
    name: z.string().optional(),
    subject: z.nullable(z.string()).optional(),
    markup: z.nullable(z.string()).optional(),
    body: z.string().optional(),
    deliveredByClerk: z.nullable(z.boolean()).optional(),
    fromEmailName: z.string().optional(),
    replyToEmailName: z.string().optional(),
  })
  .transform(v => {
    return remap$(v, {
      deliveredByClerk: 'delivered_by_clerk',
      fromEmailName: 'from_email_name',
      replyToEmailName: 'reply_to_email_name',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpsertTemplateRequestBody$ {
  /** @deprecated use `UpsertTemplateRequestBody$inboundSchema` instead. */
  export const inboundSchema = UpsertTemplateRequestBody$inboundSchema;
  /** @deprecated use `UpsertTemplateRequestBody$outboundSchema` instead. */
  export const outboundSchema = UpsertTemplateRequestBody$outboundSchema;
  /** @deprecated use `UpsertTemplateRequestBody$Outbound` instead. */
  export type Outbound = UpsertTemplateRequestBody$Outbound;
}

export function upsertTemplateRequestBodyToJSON(upsertTemplateRequestBody: UpsertTemplateRequestBody): string {
  return JSON.stringify(UpsertTemplateRequestBody$outboundSchema.parse(upsertTemplateRequestBody));
}

export function upsertTemplateRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<UpsertTemplateRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => UpsertTemplateRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpsertTemplateRequestBody' from JSON`,
  );
}

/** @internal */
export const UpsertTemplateRequest$inboundSchema: z.ZodType<UpsertTemplateRequest, z.ZodTypeDef, unknown> = z
  .object({
    template_type: UpsertTemplatePathParamTemplateType$inboundSchema,
    slug: z.string(),
    RequestBody: z.lazy(() => UpsertTemplateRequestBody$inboundSchema).optional(),
  })
  .transform(v => {
    return remap$(v, {
      template_type: 'templateType',
      RequestBody: 'requestBody',
    });
  });

/** @internal */
export type UpsertTemplateRequest$Outbound = {
  template_type: string;
  slug: string;
  RequestBody?: UpsertTemplateRequestBody$Outbound | undefined;
};

/** @internal */
export const UpsertTemplateRequest$outboundSchema: z.ZodType<
  UpsertTemplateRequest$Outbound,
  z.ZodTypeDef,
  UpsertTemplateRequest
> = z
  .object({
    templateType: UpsertTemplatePathParamTemplateType$outboundSchema,
    slug: z.string(),
    requestBody: z.lazy(() => UpsertTemplateRequestBody$outboundSchema).optional(),
  })
  .transform(v => {
    return remap$(v, {
      templateType: 'template_type',
      requestBody: 'RequestBody',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpsertTemplateRequest$ {
  /** @deprecated use `UpsertTemplateRequest$inboundSchema` instead. */
  export const inboundSchema = UpsertTemplateRequest$inboundSchema;
  /** @deprecated use `UpsertTemplateRequest$outboundSchema` instead. */
  export const outboundSchema = UpsertTemplateRequest$outboundSchema;
  /** @deprecated use `UpsertTemplateRequest$Outbound` instead. */
  export type Outbound = UpsertTemplateRequest$Outbound;
}

export function upsertTemplateRequestToJSON(upsertTemplateRequest: UpsertTemplateRequest): string {
  return JSON.stringify(UpsertTemplateRequest$outboundSchema.parse(upsertTemplateRequest));
}

export function upsertTemplateRequestFromJSON(
  jsonString: string,
): SafeParseResult<UpsertTemplateRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => UpsertTemplateRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpsertTemplateRequest' from JSON`,
  );
}
