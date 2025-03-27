/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type CreateOrganizationRequestBody = {
  /**
   * The name of the new organization.
   *
   * @remarks
   * May not contain URLs or HTML.
   * Max length: 256
   */
  name: string;
  /**
   * The ID of the User who will become the administrator for the new organization
   */
  createdBy?: string | null | undefined;
  /**
   * Metadata saved on the organization, accessible only from the Backend API
   */
  privateMetadata?: { [k: string]: any } | null | undefined;
  /**
   * Metadata saved on the organization, read-only from the Frontend API and fully accessible (read/write) from the Backend API
   */
  publicMetadata?: { [k: string]: any } | null | undefined;
  /**
   * A slug for the new organization.
   *
   * @remarks
   * Can contain only lowercase alphanumeric characters and the dash "-".
   * Must be unique for the instance.
   */
  slug?: string | null | undefined;
  /**
   * The maximum number of memberships allowed for this organization
   */
  maxAllowedMemberships?: number | null | undefined;
  /**
   * A custom date/time denoting _when_ the organization was created, specified in RFC3339 format (e.g. `2012-10-20T07:15:20.902Z`).
   */
  createdAt?: string | null | undefined;
};

/** @internal */
export const CreateOrganizationRequestBody$inboundSchema: z.ZodType<
  CreateOrganizationRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.string(),
  created_by: z.nullable(z.string()).optional(),
  private_metadata: z.nullable(z.record(z.any())).optional(),
  public_metadata: z.nullable(z.record(z.any())).optional(),
  slug: z.nullable(z.string()).optional(),
  max_allowed_memberships: z.nullable(z.number().int()).optional(),
  created_at: z.nullable(z.string()).optional(),
}).transform((v) => {
  return remap$(v, {
    "created_by": "createdBy",
    "private_metadata": "privateMetadata",
    "public_metadata": "publicMetadata",
    "max_allowed_memberships": "maxAllowedMemberships",
    "created_at": "createdAt",
  });
});

/** @internal */
export type CreateOrganizationRequestBody$Outbound = {
  name: string;
  created_by?: string | null | undefined;
  private_metadata?: { [k: string]: any } | null | undefined;
  public_metadata?: { [k: string]: any } | null | undefined;
  slug?: string | null | undefined;
  max_allowed_memberships?: number | null | undefined;
  created_at?: string | null | undefined;
};

/** @internal */
export const CreateOrganizationRequestBody$outboundSchema: z.ZodType<
  CreateOrganizationRequestBody$Outbound,
  z.ZodTypeDef,
  CreateOrganizationRequestBody
> = z.object({
  name: z.string(),
  createdBy: z.nullable(z.string()).optional(),
  privateMetadata: z.nullable(z.record(z.any())).optional(),
  publicMetadata: z.nullable(z.record(z.any())).optional(),
  slug: z.nullable(z.string()).optional(),
  maxAllowedMemberships: z.nullable(z.number().int()).optional(),
  createdAt: z.nullable(z.string()).optional(),
}).transform((v) => {
  return remap$(v, {
    createdBy: "created_by",
    privateMetadata: "private_metadata",
    publicMetadata: "public_metadata",
    maxAllowedMemberships: "max_allowed_memberships",
    createdAt: "created_at",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateOrganizationRequestBody$ {
  /** @deprecated use `CreateOrganizationRequestBody$inboundSchema` instead. */
  export const inboundSchema = CreateOrganizationRequestBody$inboundSchema;
  /** @deprecated use `CreateOrganizationRequestBody$outboundSchema` instead. */
  export const outboundSchema = CreateOrganizationRequestBody$outboundSchema;
  /** @deprecated use `CreateOrganizationRequestBody$Outbound` instead. */
  export type Outbound = CreateOrganizationRequestBody$Outbound;
}

export function createOrganizationRequestBodyToJSON(
  createOrganizationRequestBody: CreateOrganizationRequestBody,
): string {
  return JSON.stringify(
    CreateOrganizationRequestBody$outboundSchema.parse(
      createOrganizationRequestBody,
    ),
  );
}

export function createOrganizationRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateOrganizationRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => CreateOrganizationRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateOrganizationRequestBody' from JSON`,
  );
}
