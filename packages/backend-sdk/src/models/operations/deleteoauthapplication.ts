/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type DeleteOAuthApplicationRequest = {
  /**
   * The ID of the OAuth application to delete
   */
  oauthApplicationId: string;
};

/** @internal */
export const DeleteOAuthApplicationRequest$inboundSchema: z.ZodType<
  DeleteOAuthApplicationRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  oauth_application_id: z.string(),
}).transform((v) => {
  return remap$(v, {
    "oauth_application_id": "oauthApplicationId",
  });
});

/** @internal */
export type DeleteOAuthApplicationRequest$Outbound = {
  oauth_application_id: string;
};

/** @internal */
export const DeleteOAuthApplicationRequest$outboundSchema: z.ZodType<
  DeleteOAuthApplicationRequest$Outbound,
  z.ZodTypeDef,
  DeleteOAuthApplicationRequest
> = z.object({
  oauthApplicationId: z.string(),
}).transform((v) => {
  return remap$(v, {
    oauthApplicationId: "oauth_application_id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace DeleteOAuthApplicationRequest$ {
  /** @deprecated use `DeleteOAuthApplicationRequest$inboundSchema` instead. */
  export const inboundSchema = DeleteOAuthApplicationRequest$inboundSchema;
  /** @deprecated use `DeleteOAuthApplicationRequest$outboundSchema` instead. */
  export const outboundSchema = DeleteOAuthApplicationRequest$outboundSchema;
  /** @deprecated use `DeleteOAuthApplicationRequest$Outbound` instead. */
  export type Outbound = DeleteOAuthApplicationRequest$Outbound;
}

export function deleteOAuthApplicationRequestToJSON(
  deleteOAuthApplicationRequest: DeleteOAuthApplicationRequest,
): string {
  return JSON.stringify(
    DeleteOAuthApplicationRequest$outboundSchema.parse(
      deleteOAuthApplicationRequest,
    ),
  );
}

export function deleteOAuthApplicationRequestFromJSON(
  jsonString: string,
): SafeParseResult<DeleteOAuthApplicationRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => DeleteOAuthApplicationRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'DeleteOAuthApplicationRequest' from JSON`,
  );
}
