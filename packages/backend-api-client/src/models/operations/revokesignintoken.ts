/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type RevokeSignInTokenRequest = {
  /**
   * The ID of the sign-in token to be revoked
   */
  signInTokenId: string;
};

/** @internal */
export const RevokeSignInTokenRequest$inboundSchema: z.ZodType<
  RevokeSignInTokenRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  sign_in_token_id: z.string(),
}).transform((v) => {
  return remap$(v, {
    "sign_in_token_id": "signInTokenId",
  });
});

/** @internal */
export type RevokeSignInTokenRequest$Outbound = {
  sign_in_token_id: string;
};

/** @internal */
export const RevokeSignInTokenRequest$outboundSchema: z.ZodType<
  RevokeSignInTokenRequest$Outbound,
  z.ZodTypeDef,
  RevokeSignInTokenRequest
> = z.object({
  signInTokenId: z.string(),
}).transform((v) => {
  return remap$(v, {
    signInTokenId: "sign_in_token_id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace RevokeSignInTokenRequest$ {
  /** @deprecated use `RevokeSignInTokenRequest$inboundSchema` instead. */
  export const inboundSchema = RevokeSignInTokenRequest$inboundSchema;
  /** @deprecated use `RevokeSignInTokenRequest$outboundSchema` instead. */
  export const outboundSchema = RevokeSignInTokenRequest$outboundSchema;
  /** @deprecated use `RevokeSignInTokenRequest$Outbound` instead. */
  export type Outbound = RevokeSignInTokenRequest$Outbound;
}

export function revokeSignInTokenRequestToJSON(
  revokeSignInTokenRequest: RevokeSignInTokenRequest,
): string {
  return JSON.stringify(
    RevokeSignInTokenRequest$outboundSchema.parse(revokeSignInTokenRequest),
  );
}

export function revokeSignInTokenRequestFromJSON(
  jsonString: string,
): SafeParseResult<RevokeSignInTokenRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => RevokeSignInTokenRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'RevokeSignInTokenRequest' from JSON`,
  );
}
