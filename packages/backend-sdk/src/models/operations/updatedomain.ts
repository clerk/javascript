/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type UpdateDomainRequestBody = {
  /**
   * The new domain name. For development instances, can contain the port,
   *
   * @remarks
   * i.e `myhostname:3000`. For production instances, must be a valid FQDN,
   * i.e `mysite.com`. Cannot contain protocol scheme.
   */
  name?: string | null | undefined;
  /**
   * The full URL of the proxy that will forward requests to Clerk's Frontend API.
   *
   * @remarks
   * Can only be updated for production instances.
   */
  proxyUrl?: string | null | undefined;
  /**
   * Whether this is a domain for a secondary app, meaning that any subdomain provided is significant and
   *
   * @remarks
   * will be stored as part of the domain. This is useful for supporting multiple apps (one primary and
   * multiple secondaries) on the same root domain (eTLD+1).
   */
  isSecondary?: boolean | null | undefined;
};

export type UpdateDomainRequest = {
  /**
   * The ID of the domain that will be updated.
   */
  domainId: string;
  requestBody: UpdateDomainRequestBody;
};

/** @internal */
export const UpdateDomainRequestBody$inboundSchema: z.ZodType<
  UpdateDomainRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.nullable(z.string()).optional(),
  proxy_url: z.nullable(z.string()).optional(),
  is_secondary: z.nullable(z.boolean()).optional(),
}).transform((v) => {
  return remap$(v, {
    "proxy_url": "proxyUrl",
    "is_secondary": "isSecondary",
  });
});

/** @internal */
export type UpdateDomainRequestBody$Outbound = {
  name?: string | null | undefined;
  proxy_url?: string | null | undefined;
  is_secondary?: boolean | null | undefined;
};

/** @internal */
export const UpdateDomainRequestBody$outboundSchema: z.ZodType<
  UpdateDomainRequestBody$Outbound,
  z.ZodTypeDef,
  UpdateDomainRequestBody
> = z.object({
  name: z.nullable(z.string()).optional(),
  proxyUrl: z.nullable(z.string()).optional(),
  isSecondary: z.nullable(z.boolean()).optional(),
}).transform((v) => {
  return remap$(v, {
    proxyUrl: "proxy_url",
    isSecondary: "is_secondary",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateDomainRequestBody$ {
  /** @deprecated use `UpdateDomainRequestBody$inboundSchema` instead. */
  export const inboundSchema = UpdateDomainRequestBody$inboundSchema;
  /** @deprecated use `UpdateDomainRequestBody$outboundSchema` instead. */
  export const outboundSchema = UpdateDomainRequestBody$outboundSchema;
  /** @deprecated use `UpdateDomainRequestBody$Outbound` instead. */
  export type Outbound = UpdateDomainRequestBody$Outbound;
}

export function updateDomainRequestBodyToJSON(
  updateDomainRequestBody: UpdateDomainRequestBody,
): string {
  return JSON.stringify(
    UpdateDomainRequestBody$outboundSchema.parse(updateDomainRequestBody),
  );
}

export function updateDomainRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<UpdateDomainRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => UpdateDomainRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateDomainRequestBody' from JSON`,
  );
}

/** @internal */
export const UpdateDomainRequest$inboundSchema: z.ZodType<
  UpdateDomainRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  domain_id: z.string(),
  RequestBody: z.lazy(() => UpdateDomainRequestBody$inboundSchema),
}).transform((v) => {
  return remap$(v, {
    "domain_id": "domainId",
    "RequestBody": "requestBody",
  });
});

/** @internal */
export type UpdateDomainRequest$Outbound = {
  domain_id: string;
  RequestBody: UpdateDomainRequestBody$Outbound;
};

/** @internal */
export const UpdateDomainRequest$outboundSchema: z.ZodType<
  UpdateDomainRequest$Outbound,
  z.ZodTypeDef,
  UpdateDomainRequest
> = z.object({
  domainId: z.string(),
  requestBody: z.lazy(() => UpdateDomainRequestBody$outboundSchema),
}).transform((v) => {
  return remap$(v, {
    domainId: "domain_id",
    requestBody: "RequestBody",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateDomainRequest$ {
  /** @deprecated use `UpdateDomainRequest$inboundSchema` instead. */
  export const inboundSchema = UpdateDomainRequest$inboundSchema;
  /** @deprecated use `UpdateDomainRequest$outboundSchema` instead. */
  export const outboundSchema = UpdateDomainRequest$outboundSchema;
  /** @deprecated use `UpdateDomainRequest$Outbound` instead. */
  export type Outbound = UpdateDomainRequest$Outbound;
}

export function updateDomainRequestToJSON(
  updateDomainRequest: UpdateDomainRequest,
): string {
  return JSON.stringify(
    UpdateDomainRequest$outboundSchema.parse(updateDomainRequest),
  );
}

export function updateDomainRequestFromJSON(
  jsonString: string,
): SafeParseResult<UpdateDomainRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => UpdateDomainRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateDomainRequest' from JSON`,
  );
}
