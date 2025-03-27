/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type UpdateInstanceAuthConfigRequestBody = {
  /**
   * Whether sign up is restricted to email addresses, phone numbers and usernames that are on the allowlist.
   */
  restrictedToAllowlist?: boolean | null | undefined;
  /**
   * The local part of the email address from which authentication-related emails (e.g. OTP code, magic links) will be sent.
   *
   * @remarks
   * Only alphanumeric values are allowed.
   * Note that this value should contain only the local part of the address (e.g. `foo` for `foo@example.com`).
   */
  fromEmailAddress?: string | null | undefined;
  /**
   * Enable the Progressive Sign Up algorithm. Refer to the [docs](https://clerk.com/docs/upgrade-guides/progressive-sign-up) for more info.
   */
  progressiveSignUp?: boolean | null | undefined;
  /**
   * The "enhanced_email_deliverability" feature will send emails from "verifications@clerk.dev" instead of your domain.
   *
   * @remarks
   * This can be helpful if you do not have a high domain reputation.
   */
  enhancedEmailDeliverability?: boolean | null | undefined;
  /**
   * Toggles test mode for this instance, allowing the use of test email addresses and phone numbers.
   *
   * @remarks
   * Defaults to true for development instances.
   */
  testMode?: boolean | null | undefined;
};

/** @internal */
export const UpdateInstanceAuthConfigRequestBody$inboundSchema: z.ZodType<
  UpdateInstanceAuthConfigRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  restricted_to_allowlist: z.nullable(z.boolean().default(false)),
  from_email_address: z.nullable(z.string()).optional(),
  progressive_sign_up: z.nullable(z.boolean()).optional(),
  enhanced_email_deliverability: z.nullable(z.boolean()).optional(),
  test_mode: z.nullable(z.boolean()).optional(),
}).transform((v) => {
  return remap$(v, {
    "restricted_to_allowlist": "restrictedToAllowlist",
    "from_email_address": "fromEmailAddress",
    "progressive_sign_up": "progressiveSignUp",
    "enhanced_email_deliverability": "enhancedEmailDeliverability",
    "test_mode": "testMode",
  });
});

/** @internal */
export type UpdateInstanceAuthConfigRequestBody$Outbound = {
  restricted_to_allowlist: boolean | null;
  from_email_address?: string | null | undefined;
  progressive_sign_up?: boolean | null | undefined;
  enhanced_email_deliverability?: boolean | null | undefined;
  test_mode?: boolean | null | undefined;
};

/** @internal */
export const UpdateInstanceAuthConfigRequestBody$outboundSchema: z.ZodType<
  UpdateInstanceAuthConfigRequestBody$Outbound,
  z.ZodTypeDef,
  UpdateInstanceAuthConfigRequestBody
> = z.object({
  restrictedToAllowlist: z.nullable(z.boolean().default(false)),
  fromEmailAddress: z.nullable(z.string()).optional(),
  progressiveSignUp: z.nullable(z.boolean()).optional(),
  enhancedEmailDeliverability: z.nullable(z.boolean()).optional(),
  testMode: z.nullable(z.boolean()).optional(),
}).transform((v) => {
  return remap$(v, {
    restrictedToAllowlist: "restricted_to_allowlist",
    fromEmailAddress: "from_email_address",
    progressiveSignUp: "progressive_sign_up",
    enhancedEmailDeliverability: "enhanced_email_deliverability",
    testMode: "test_mode",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateInstanceAuthConfigRequestBody$ {
  /** @deprecated use `UpdateInstanceAuthConfigRequestBody$inboundSchema` instead. */
  export const inboundSchema =
    UpdateInstanceAuthConfigRequestBody$inboundSchema;
  /** @deprecated use `UpdateInstanceAuthConfigRequestBody$outboundSchema` instead. */
  export const outboundSchema =
    UpdateInstanceAuthConfigRequestBody$outboundSchema;
  /** @deprecated use `UpdateInstanceAuthConfigRequestBody$Outbound` instead. */
  export type Outbound = UpdateInstanceAuthConfigRequestBody$Outbound;
}

export function updateInstanceAuthConfigRequestBodyToJSON(
  updateInstanceAuthConfigRequestBody: UpdateInstanceAuthConfigRequestBody,
): string {
  return JSON.stringify(
    UpdateInstanceAuthConfigRequestBody$outboundSchema.parse(
      updateInstanceAuthConfigRequestBody,
    ),
  );
}

export function updateInstanceAuthConfigRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<UpdateInstanceAuthConfigRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      UpdateInstanceAuthConfigRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateInstanceAuthConfigRequestBody' from JSON`,
  );
}
