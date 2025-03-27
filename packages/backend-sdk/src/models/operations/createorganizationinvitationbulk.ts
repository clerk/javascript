/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type CreateOrganizationInvitationBulkRequestBody = {
  /**
   * The email address of the new member that is going to be invited to the organization
   */
  emailAddress: string;
  /**
   * The ID of the user that invites the new member to the organization.
   *
   * @remarks
   * Must be an administrator in the organization.
   */
  inviterUserId?: string | null | undefined;
  /**
   * The role of the new member in the organization
   */
  role: string;
  /**
   * Metadata saved on the organization invitation, read-only from the Frontend API and fully accessible (read/write) from the Backend API.
   *
   * @remarks
   * When the organization invitation is accepted, the metadata will be transferred to the newly created organization membership.
   */
  publicMetadata?: { [k: string]: any } | null | undefined;
  /**
   * Metadata saved on the organization invitation, fully accessible (read/write) from the Backend API but not visible from the Frontend API.
   *
   * @remarks
   * When the organization invitation is accepted, the metadata will be transferred to the newly created organization membership.
   */
  privateMetadata?: { [k: string]: any } | null | undefined;
  /**
   * Optional URL that the invitee will be redirected to once they accept the invitation by clicking the join link in the invitation email.
   */
  redirectUrl?: string | null | undefined;
  /**
   * The number of days the invitation will be valid for. By default, the invitation has a 30 days expire.
   */
  expiresInDays?: number | null | undefined;
};

export type CreateOrganizationInvitationBulkRequest = {
  /**
   * The organization ID.
   */
  organizationId: string;
  requestBody: Array<CreateOrganizationInvitationBulkRequestBody>;
};

/** @internal */
export const CreateOrganizationInvitationBulkRequestBody$inboundSchema:
  z.ZodType<
    CreateOrganizationInvitationBulkRequestBody,
    z.ZodTypeDef,
    unknown
  > = z.object({
    email_address: z.string(),
    inviter_user_id: z.nullable(z.string()).optional(),
    role: z.string(),
    public_metadata: z.nullable(z.record(z.any())).optional(),
    private_metadata: z.nullable(z.record(z.any())).optional(),
    redirect_url: z.nullable(z.string()).optional(),
    expires_in_days: z.nullable(z.number().int()).optional(),
  }).transform((v) => {
    return remap$(v, {
      "email_address": "emailAddress",
      "inviter_user_id": "inviterUserId",
      "public_metadata": "publicMetadata",
      "private_metadata": "privateMetadata",
      "redirect_url": "redirectUrl",
      "expires_in_days": "expiresInDays",
    });
  });

/** @internal */
export type CreateOrganizationInvitationBulkRequestBody$Outbound = {
  email_address: string;
  inviter_user_id?: string | null | undefined;
  role: string;
  public_metadata?: { [k: string]: any } | null | undefined;
  private_metadata?: { [k: string]: any } | null | undefined;
  redirect_url?: string | null | undefined;
  expires_in_days?: number | null | undefined;
};

/** @internal */
export const CreateOrganizationInvitationBulkRequestBody$outboundSchema:
  z.ZodType<
    CreateOrganizationInvitationBulkRequestBody$Outbound,
    z.ZodTypeDef,
    CreateOrganizationInvitationBulkRequestBody
  > = z.object({
    emailAddress: z.string(),
    inviterUserId: z.nullable(z.string()).optional(),
    role: z.string(),
    publicMetadata: z.nullable(z.record(z.any())).optional(),
    privateMetadata: z.nullable(z.record(z.any())).optional(),
    redirectUrl: z.nullable(z.string()).optional(),
    expiresInDays: z.nullable(z.number().int()).optional(),
  }).transform((v) => {
    return remap$(v, {
      emailAddress: "email_address",
      inviterUserId: "inviter_user_id",
      publicMetadata: "public_metadata",
      privateMetadata: "private_metadata",
      redirectUrl: "redirect_url",
      expiresInDays: "expires_in_days",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateOrganizationInvitationBulkRequestBody$ {
  /** @deprecated use `CreateOrganizationInvitationBulkRequestBody$inboundSchema` instead. */
  export const inboundSchema =
    CreateOrganizationInvitationBulkRequestBody$inboundSchema;
  /** @deprecated use `CreateOrganizationInvitationBulkRequestBody$outboundSchema` instead. */
  export const outboundSchema =
    CreateOrganizationInvitationBulkRequestBody$outboundSchema;
  /** @deprecated use `CreateOrganizationInvitationBulkRequestBody$Outbound` instead. */
  export type Outbound = CreateOrganizationInvitationBulkRequestBody$Outbound;
}

export function createOrganizationInvitationBulkRequestBodyToJSON(
  createOrganizationInvitationBulkRequestBody:
    CreateOrganizationInvitationBulkRequestBody,
): string {
  return JSON.stringify(
    CreateOrganizationInvitationBulkRequestBody$outboundSchema.parse(
      createOrganizationInvitationBulkRequestBody,
    ),
  );
}

export function createOrganizationInvitationBulkRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<
  CreateOrganizationInvitationBulkRequestBody,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      CreateOrganizationInvitationBulkRequestBody$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'CreateOrganizationInvitationBulkRequestBody' from JSON`,
  );
}

/** @internal */
export const CreateOrganizationInvitationBulkRequest$inboundSchema: z.ZodType<
  CreateOrganizationInvitationBulkRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  organization_id: z.string(),
  RequestBody: z.array(
    z.lazy(() => CreateOrganizationInvitationBulkRequestBody$inboundSchema),
  ),
}).transform((v) => {
  return remap$(v, {
    "organization_id": "organizationId",
    "RequestBody": "requestBody",
  });
});

/** @internal */
export type CreateOrganizationInvitationBulkRequest$Outbound = {
  organization_id: string;
  RequestBody: Array<CreateOrganizationInvitationBulkRequestBody$Outbound>;
};

/** @internal */
export const CreateOrganizationInvitationBulkRequest$outboundSchema: z.ZodType<
  CreateOrganizationInvitationBulkRequest$Outbound,
  z.ZodTypeDef,
  CreateOrganizationInvitationBulkRequest
> = z.object({
  organizationId: z.string(),
  requestBody: z.array(
    z.lazy(() => CreateOrganizationInvitationBulkRequestBody$outboundSchema),
  ),
}).transform((v) => {
  return remap$(v, {
    organizationId: "organization_id",
    requestBody: "RequestBody",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateOrganizationInvitationBulkRequest$ {
  /** @deprecated use `CreateOrganizationInvitationBulkRequest$inboundSchema` instead. */
  export const inboundSchema =
    CreateOrganizationInvitationBulkRequest$inboundSchema;
  /** @deprecated use `CreateOrganizationInvitationBulkRequest$outboundSchema` instead. */
  export const outboundSchema =
    CreateOrganizationInvitationBulkRequest$outboundSchema;
  /** @deprecated use `CreateOrganizationInvitationBulkRequest$Outbound` instead. */
  export type Outbound = CreateOrganizationInvitationBulkRequest$Outbound;
}

export function createOrganizationInvitationBulkRequestToJSON(
  createOrganizationInvitationBulkRequest:
    CreateOrganizationInvitationBulkRequest,
): string {
  return JSON.stringify(
    CreateOrganizationInvitationBulkRequest$outboundSchema.parse(
      createOrganizationInvitationBulkRequest,
    ),
  );
}

export function createOrganizationInvitationBulkRequestFromJSON(
  jsonString: string,
): SafeParseResult<
  CreateOrganizationInvitationBulkRequest,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      CreateOrganizationInvitationBulkRequest$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'CreateOrganizationInvitationBulkRequest' from JSON`,
  );
}
