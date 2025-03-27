/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type CreateWaitlistEntryRequestBody = {
  /**
   * The email address to add to the waitlist
   */
  emailAddress: string;
  /**
   * Optional flag which denotes whether a confirmation email should be sent to the given email address.
   *
   * @remarks
   * Defaults to `true`.
   */
  notify?: boolean | null | undefined;
};

/** @internal */
export const CreateWaitlistEntryRequestBody$inboundSchema: z.ZodType<
  CreateWaitlistEntryRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  email_address: z.string(),
  notify: z.nullable(z.boolean().default(true)),
}).transform((v) => {
  return remap$(v, {
    "email_address": "emailAddress",
  });
});

/** @internal */
export type CreateWaitlistEntryRequestBody$Outbound = {
  email_address: string;
  notify: boolean | null;
};

/** @internal */
export const CreateWaitlistEntryRequestBody$outboundSchema: z.ZodType<
  CreateWaitlistEntryRequestBody$Outbound,
  z.ZodTypeDef,
  CreateWaitlistEntryRequestBody
> = z.object({
  emailAddress: z.string(),
  notify: z.nullable(z.boolean().default(true)),
}).transform((v) => {
  return remap$(v, {
    emailAddress: "email_address",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateWaitlistEntryRequestBody$ {
  /** @deprecated use `CreateWaitlistEntryRequestBody$inboundSchema` instead. */
  export const inboundSchema = CreateWaitlistEntryRequestBody$inboundSchema;
  /** @deprecated use `CreateWaitlistEntryRequestBody$outboundSchema` instead. */
  export const outboundSchema = CreateWaitlistEntryRequestBody$outboundSchema;
  /** @deprecated use `CreateWaitlistEntryRequestBody$Outbound` instead. */
  export type Outbound = CreateWaitlistEntryRequestBody$Outbound;
}

export function createWaitlistEntryRequestBodyToJSON(
  createWaitlistEntryRequestBody: CreateWaitlistEntryRequestBody,
): string {
  return JSON.stringify(
    CreateWaitlistEntryRequestBody$outboundSchema.parse(
      createWaitlistEntryRequestBody,
    ),
  );
}

export function createWaitlistEntryRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateWaitlistEntryRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => CreateWaitlistEntryRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateWaitlistEntryRequestBody' from JSON`,
  );
}
