/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

/**
 * Required parameters
 */
export type PreviewTemplateRequestBody = {
  /**
   * The email subject.
   *
   * @remarks
   * Applicable only to email templates.
   */
  subject?: string | null | undefined;
  /**
   * The template body before variable interpolation
   */
  body?: string | undefined;
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

export type PreviewTemplateRequest = {
  /**
   * The type of template to preview
   */
  templateType: string;
  /**
   * The slug of the template to preview
   */
  slug: string;
  /**
   * Required parameters
   */
  requestBody?: PreviewTemplateRequestBody | undefined;
};

/**
 * OK
 */
export type PreviewTemplateResponseBody = {};

/** @internal */
export const PreviewTemplateRequestBody$inboundSchema: z.ZodType<
  PreviewTemplateRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  subject: z.nullable(z.string()).optional(),
  body: z.string().optional(),
  from_email_name: z.string().optional(),
  reply_to_email_name: z.string().optional(),
}).transform((v) => {
  return remap$(v, {
    "from_email_name": "fromEmailName",
    "reply_to_email_name": "replyToEmailName",
  });
});

/** @internal */
export type PreviewTemplateRequestBody$Outbound = {
  subject?: string | null | undefined;
  body?: string | undefined;
  from_email_name?: string | undefined;
  reply_to_email_name?: string | undefined;
};

/** @internal */
export const PreviewTemplateRequestBody$outboundSchema: z.ZodType<
  PreviewTemplateRequestBody$Outbound,
  z.ZodTypeDef,
  PreviewTemplateRequestBody
> = z.object({
  subject: z.nullable(z.string()).optional(),
  body: z.string().optional(),
  fromEmailName: z.string().optional(),
  replyToEmailName: z.string().optional(),
}).transform((v) => {
  return remap$(v, {
    fromEmailName: "from_email_name",
    replyToEmailName: "reply_to_email_name",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PreviewTemplateRequestBody$ {
  /** @deprecated use `PreviewTemplateRequestBody$inboundSchema` instead. */
  export const inboundSchema = PreviewTemplateRequestBody$inboundSchema;
  /** @deprecated use `PreviewTemplateRequestBody$outboundSchema` instead. */
  export const outboundSchema = PreviewTemplateRequestBody$outboundSchema;
  /** @deprecated use `PreviewTemplateRequestBody$Outbound` instead. */
  export type Outbound = PreviewTemplateRequestBody$Outbound;
}

export function previewTemplateRequestBodyToJSON(
  previewTemplateRequestBody: PreviewTemplateRequestBody,
): string {
  return JSON.stringify(
    PreviewTemplateRequestBody$outboundSchema.parse(previewTemplateRequestBody),
  );
}

export function previewTemplateRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<PreviewTemplateRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PreviewTemplateRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PreviewTemplateRequestBody' from JSON`,
  );
}

/** @internal */
export const PreviewTemplateRequest$inboundSchema: z.ZodType<
  PreviewTemplateRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  template_type: z.string(),
  slug: z.string(),
  RequestBody: z.lazy(() => PreviewTemplateRequestBody$inboundSchema)
    .optional(),
}).transform((v) => {
  return remap$(v, {
    "template_type": "templateType",
    "RequestBody": "requestBody",
  });
});

/** @internal */
export type PreviewTemplateRequest$Outbound = {
  template_type: string;
  slug: string;
  RequestBody?: PreviewTemplateRequestBody$Outbound | undefined;
};

/** @internal */
export const PreviewTemplateRequest$outboundSchema: z.ZodType<
  PreviewTemplateRequest$Outbound,
  z.ZodTypeDef,
  PreviewTemplateRequest
> = z.object({
  templateType: z.string(),
  slug: z.string(),
  requestBody: z.lazy(() => PreviewTemplateRequestBody$outboundSchema)
    .optional(),
}).transform((v) => {
  return remap$(v, {
    templateType: "template_type",
    requestBody: "RequestBody",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PreviewTemplateRequest$ {
  /** @deprecated use `PreviewTemplateRequest$inboundSchema` instead. */
  export const inboundSchema = PreviewTemplateRequest$inboundSchema;
  /** @deprecated use `PreviewTemplateRequest$outboundSchema` instead. */
  export const outboundSchema = PreviewTemplateRequest$outboundSchema;
  /** @deprecated use `PreviewTemplateRequest$Outbound` instead. */
  export type Outbound = PreviewTemplateRequest$Outbound;
}

export function previewTemplateRequestToJSON(
  previewTemplateRequest: PreviewTemplateRequest,
): string {
  return JSON.stringify(
    PreviewTemplateRequest$outboundSchema.parse(previewTemplateRequest),
  );
}

export function previewTemplateRequestFromJSON(
  jsonString: string,
): SafeParseResult<PreviewTemplateRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PreviewTemplateRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PreviewTemplateRequest' from JSON`,
  );
}

/** @internal */
export const PreviewTemplateResponseBody$inboundSchema: z.ZodType<
  PreviewTemplateResponseBody,
  z.ZodTypeDef,
  unknown
> = z.object({});

/** @internal */
export type PreviewTemplateResponseBody$Outbound = {};

/** @internal */
export const PreviewTemplateResponseBody$outboundSchema: z.ZodType<
  PreviewTemplateResponseBody$Outbound,
  z.ZodTypeDef,
  PreviewTemplateResponseBody
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PreviewTemplateResponseBody$ {
  /** @deprecated use `PreviewTemplateResponseBody$inboundSchema` instead. */
  export const inboundSchema = PreviewTemplateResponseBody$inboundSchema;
  /** @deprecated use `PreviewTemplateResponseBody$outboundSchema` instead. */
  export const outboundSchema = PreviewTemplateResponseBody$outboundSchema;
  /** @deprecated use `PreviewTemplateResponseBody$Outbound` instead. */
  export type Outbound = PreviewTemplateResponseBody$Outbound;
}

export function previewTemplateResponseBodyToJSON(
  previewTemplateResponseBody: PreviewTemplateResponseBody,
): string {
  return JSON.stringify(
    PreviewTemplateResponseBody$outboundSchema.parse(
      previewTemplateResponseBody,
    ),
  );
}

export function previewTemplateResponseBodyFromJSON(
  jsonString: string,
): SafeParseResult<PreviewTemplateResponseBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PreviewTemplateResponseBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PreviewTemplateResponseBody' from JSON`,
  );
}
