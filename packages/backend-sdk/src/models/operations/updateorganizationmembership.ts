/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type UpdateOrganizationMembershipRequestBody = {
  /**
   * The new role of the given membership.
   */
  role: string;
};

export type UpdateOrganizationMembershipRequest = {
  /**
   * The ID of the organization the membership belongs to
   */
  organizationId: string;
  /**
   * The ID of the user that this membership belongs to
   */
  userId: string;
  requestBody: UpdateOrganizationMembershipRequestBody;
};

/** @internal */
export const UpdateOrganizationMembershipRequestBody$inboundSchema: z.ZodType<
  UpdateOrganizationMembershipRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  role: z.string(),
});

/** @internal */
export type UpdateOrganizationMembershipRequestBody$Outbound = {
  role: string;
};

/** @internal */
export const UpdateOrganizationMembershipRequestBody$outboundSchema: z.ZodType<
  UpdateOrganizationMembershipRequestBody$Outbound,
  z.ZodTypeDef,
  UpdateOrganizationMembershipRequestBody
> = z.object({
  role: z.string(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateOrganizationMembershipRequestBody$ {
  /** @deprecated use `UpdateOrganizationMembershipRequestBody$inboundSchema` instead. */
  export const inboundSchema =
    UpdateOrganizationMembershipRequestBody$inboundSchema;
  /** @deprecated use `UpdateOrganizationMembershipRequestBody$outboundSchema` instead. */
  export const outboundSchema =
    UpdateOrganizationMembershipRequestBody$outboundSchema;
  /** @deprecated use `UpdateOrganizationMembershipRequestBody$Outbound` instead. */
  export type Outbound = UpdateOrganizationMembershipRequestBody$Outbound;
}

export function updateOrganizationMembershipRequestBodyToJSON(
  updateOrganizationMembershipRequestBody:
    UpdateOrganizationMembershipRequestBody,
): string {
  return JSON.stringify(
    UpdateOrganizationMembershipRequestBody$outboundSchema.parse(
      updateOrganizationMembershipRequestBody,
    ),
  );
}

export function updateOrganizationMembershipRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<
  UpdateOrganizationMembershipRequestBody,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      UpdateOrganizationMembershipRequestBody$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'UpdateOrganizationMembershipRequestBody' from JSON`,
  );
}

/** @internal */
export const UpdateOrganizationMembershipRequest$inboundSchema: z.ZodType<
  UpdateOrganizationMembershipRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  organization_id: z.string(),
  user_id: z.string(),
  RequestBody: z.lazy(() =>
    UpdateOrganizationMembershipRequestBody$inboundSchema
  ),
}).transform((v) => {
  return remap$(v, {
    "organization_id": "organizationId",
    "user_id": "userId",
    "RequestBody": "requestBody",
  });
});

/** @internal */
export type UpdateOrganizationMembershipRequest$Outbound = {
  organization_id: string;
  user_id: string;
  RequestBody: UpdateOrganizationMembershipRequestBody$Outbound;
};

/** @internal */
export const UpdateOrganizationMembershipRequest$outboundSchema: z.ZodType<
  UpdateOrganizationMembershipRequest$Outbound,
  z.ZodTypeDef,
  UpdateOrganizationMembershipRequest
> = z.object({
  organizationId: z.string(),
  userId: z.string(),
  requestBody: z.lazy(() =>
    UpdateOrganizationMembershipRequestBody$outboundSchema
  ),
}).transform((v) => {
  return remap$(v, {
    organizationId: "organization_id",
    userId: "user_id",
    requestBody: "RequestBody",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateOrganizationMembershipRequest$ {
  /** @deprecated use `UpdateOrganizationMembershipRequest$inboundSchema` instead. */
  export const inboundSchema =
    UpdateOrganizationMembershipRequest$inboundSchema;
  /** @deprecated use `UpdateOrganizationMembershipRequest$outboundSchema` instead. */
  export const outboundSchema =
    UpdateOrganizationMembershipRequest$outboundSchema;
  /** @deprecated use `UpdateOrganizationMembershipRequest$Outbound` instead. */
  export type Outbound = UpdateOrganizationMembershipRequest$Outbound;
}

export function updateOrganizationMembershipRequestToJSON(
  updateOrganizationMembershipRequest: UpdateOrganizationMembershipRequest,
): string {
  return JSON.stringify(
    UpdateOrganizationMembershipRequest$outboundSchema.parse(
      updateOrganizationMembershipRequest,
    ),
  );
}

export function updateOrganizationMembershipRequestFromJSON(
  jsonString: string,
): SafeParseResult<UpdateOrganizationMembershipRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      UpdateOrganizationMembershipRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateOrganizationMembershipRequest' from JSON`,
  );
}
