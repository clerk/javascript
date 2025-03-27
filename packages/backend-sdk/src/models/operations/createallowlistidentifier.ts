/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type CreateAllowlistIdentifierRequestBody = {
  /**
   * The identifier to be added in the allow-list.
   *
   * @remarks
   * This can be an email address, a phone number or a web3 wallet.
   */
  identifier: string;
  /**
   * This flag denotes whether the given identifier will receive an invitation to join the application.
   *
   * @remarks
   * Note that this only works for email address and phone number identifiers.
   */
  notify?: boolean | undefined;
};

/** @internal */
export const CreateAllowlistIdentifierRequestBody$inboundSchema: z.ZodType<
  CreateAllowlistIdentifierRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  identifier: z.string(),
  notify: z.boolean().default(false),
});

/** @internal */
export type CreateAllowlistIdentifierRequestBody$Outbound = {
  identifier: string;
  notify: boolean;
};

/** @internal */
export const CreateAllowlistIdentifierRequestBody$outboundSchema: z.ZodType<
  CreateAllowlistIdentifierRequestBody$Outbound,
  z.ZodTypeDef,
  CreateAllowlistIdentifierRequestBody
> = z.object({
  identifier: z.string(),
  notify: z.boolean().default(false),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateAllowlistIdentifierRequestBody$ {
  /** @deprecated use `CreateAllowlistIdentifierRequestBody$inboundSchema` instead. */
  export const inboundSchema =
    CreateAllowlistIdentifierRequestBody$inboundSchema;
  /** @deprecated use `CreateAllowlistIdentifierRequestBody$outboundSchema` instead. */
  export const outboundSchema =
    CreateAllowlistIdentifierRequestBody$outboundSchema;
  /** @deprecated use `CreateAllowlistIdentifierRequestBody$Outbound` instead. */
  export type Outbound = CreateAllowlistIdentifierRequestBody$Outbound;
}

export function createAllowlistIdentifierRequestBodyToJSON(
  createAllowlistIdentifierRequestBody: CreateAllowlistIdentifierRequestBody,
): string {
  return JSON.stringify(
    CreateAllowlistIdentifierRequestBody$outboundSchema.parse(
      createAllowlistIdentifierRequestBody,
    ),
  );
}

export function createAllowlistIdentifierRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateAllowlistIdentifierRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      CreateAllowlistIdentifierRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateAllowlistIdentifierRequestBody' from JSON`,
  );
}
