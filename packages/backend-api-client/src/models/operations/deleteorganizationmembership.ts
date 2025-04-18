/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type DeleteOrganizationMembershipRequest = {
  /**
   * The ID of the organization the membership belongs to
   */
  organizationId: string;
  /**
   * The ID of the user that this membership belongs to
   */
  userId: string;
};

/** @internal */
export const DeleteOrganizationMembershipRequest$inboundSchema: z.ZodType<
  DeleteOrganizationMembershipRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  organization_id: z.string(),
  user_id: z.string(),
}).transform((v) => {
  return remap$(v, {
    "organization_id": "organizationId",
    "user_id": "userId",
  });
});

/** @internal */
export type DeleteOrganizationMembershipRequest$Outbound = {
  organization_id: string;
  user_id: string;
};

/** @internal */
export const DeleteOrganizationMembershipRequest$outboundSchema: z.ZodType<
  DeleteOrganizationMembershipRequest$Outbound,
  z.ZodTypeDef,
  DeleteOrganizationMembershipRequest
> = z.object({
  organizationId: z.string(),
  userId: z.string(),
}).transform((v) => {
  return remap$(v, {
    organizationId: "organization_id",
    userId: "user_id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace DeleteOrganizationMembershipRequest$ {
  /** @deprecated use `DeleteOrganizationMembershipRequest$inboundSchema` instead. */
  export const inboundSchema =
    DeleteOrganizationMembershipRequest$inboundSchema;
  /** @deprecated use `DeleteOrganizationMembershipRequest$outboundSchema` instead. */
  export const outboundSchema =
    DeleteOrganizationMembershipRequest$outboundSchema;
  /** @deprecated use `DeleteOrganizationMembershipRequest$Outbound` instead. */
  export type Outbound = DeleteOrganizationMembershipRequest$Outbound;
}

export function deleteOrganizationMembershipRequestToJSON(
  deleteOrganizationMembershipRequest: DeleteOrganizationMembershipRequest,
): string {
  return JSON.stringify(
    DeleteOrganizationMembershipRequest$outboundSchema.parse(
      deleteOrganizationMembershipRequest,
    ),
  );
}

export function deleteOrganizationMembershipRequestFromJSON(
  jsonString: string,
): SafeParseResult<DeleteOrganizationMembershipRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      DeleteOrganizationMembershipRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'DeleteOrganizationMembershipRequest' from JSON`,
  );
}
