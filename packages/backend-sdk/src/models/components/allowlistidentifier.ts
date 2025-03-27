/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export const AllowlistIdentifierObject = {
  AllowlistIdentifier: "allowlist_identifier",
} as const;
/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export type AllowlistIdentifierObject = ClosedEnum<
  typeof AllowlistIdentifierObject
>;

export const IdentifierType = {
  EmailAddress: "email_address",
  PhoneNumber: "phone_number",
  Web3Wallet: "web3_wallet",
} as const;
export type IdentifierType = ClosedEnum<typeof IdentifierType>;

/**
 * Success
 */
export type AllowlistIdentifier = {
  /**
   * String representing the object's type. Objects of the same type share the same value.
   *
   * @remarks
   */
  object?: AllowlistIdentifierObject | undefined;
  id?: string | undefined;
  invitationId?: string | undefined;
  /**
   * An email address or a phone number.
   *
   * @remarks
   */
  identifier?: string | undefined;
  identifierType?: IdentifierType | undefined;
  instanceId?: string | undefined;
  /**
   * Unix timestamp of creation
   *
   * @remarks
   */
  createdAt?: number | undefined;
  /**
   * Unix timestamp of last update.
   *
   * @remarks
   */
  updatedAt?: number | undefined;
};

/** @internal */
export const AllowlistIdentifierObject$inboundSchema: z.ZodNativeEnum<
  typeof AllowlistIdentifierObject
> = z.nativeEnum(AllowlistIdentifierObject);

/** @internal */
export const AllowlistIdentifierObject$outboundSchema: z.ZodNativeEnum<
  typeof AllowlistIdentifierObject
> = AllowlistIdentifierObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AllowlistIdentifierObject$ {
  /** @deprecated use `AllowlistIdentifierObject$inboundSchema` instead. */
  export const inboundSchema = AllowlistIdentifierObject$inboundSchema;
  /** @deprecated use `AllowlistIdentifierObject$outboundSchema` instead. */
  export const outboundSchema = AllowlistIdentifierObject$outboundSchema;
}

/** @internal */
export const IdentifierType$inboundSchema: z.ZodNativeEnum<
  typeof IdentifierType
> = z.nativeEnum(IdentifierType);

/** @internal */
export const IdentifierType$outboundSchema: z.ZodNativeEnum<
  typeof IdentifierType
> = IdentifierType$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace IdentifierType$ {
  /** @deprecated use `IdentifierType$inboundSchema` instead. */
  export const inboundSchema = IdentifierType$inboundSchema;
  /** @deprecated use `IdentifierType$outboundSchema` instead. */
  export const outboundSchema = IdentifierType$outboundSchema;
}

/** @internal */
export const AllowlistIdentifier$inboundSchema: z.ZodType<
  AllowlistIdentifier,
  z.ZodTypeDef,
  unknown
> = z.object({
  object: AllowlistIdentifierObject$inboundSchema.optional(),
  id: z.string().optional(),
  invitation_id: z.string().optional(),
  identifier: z.string().optional(),
  identifier_type: IdentifierType$inboundSchema.optional(),
  instance_id: z.string().optional(),
  created_at: z.number().int().optional(),
  updated_at: z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    "invitation_id": "invitationId",
    "identifier_type": "identifierType",
    "instance_id": "instanceId",
    "created_at": "createdAt",
    "updated_at": "updatedAt",
  });
});

/** @internal */
export type AllowlistIdentifier$Outbound = {
  object?: string | undefined;
  id?: string | undefined;
  invitation_id?: string | undefined;
  identifier?: string | undefined;
  identifier_type?: string | undefined;
  instance_id?: string | undefined;
  created_at?: number | undefined;
  updated_at?: number | undefined;
};

/** @internal */
export const AllowlistIdentifier$outboundSchema: z.ZodType<
  AllowlistIdentifier$Outbound,
  z.ZodTypeDef,
  AllowlistIdentifier
> = z.object({
  object: AllowlistIdentifierObject$outboundSchema.optional(),
  id: z.string().optional(),
  invitationId: z.string().optional(),
  identifier: z.string().optional(),
  identifierType: IdentifierType$outboundSchema.optional(),
  instanceId: z.string().optional(),
  createdAt: z.number().int().optional(),
  updatedAt: z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    invitationId: "invitation_id",
    identifierType: "identifier_type",
    instanceId: "instance_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AllowlistIdentifier$ {
  /** @deprecated use `AllowlistIdentifier$inboundSchema` instead. */
  export const inboundSchema = AllowlistIdentifier$inboundSchema;
  /** @deprecated use `AllowlistIdentifier$outboundSchema` instead. */
  export const outboundSchema = AllowlistIdentifier$outboundSchema;
  /** @deprecated use `AllowlistIdentifier$Outbound` instead. */
  export type Outbound = AllowlistIdentifier$Outbound;
}

export function allowlistIdentifierToJSON(
  allowlistIdentifier: AllowlistIdentifier,
): string {
  return JSON.stringify(
    AllowlistIdentifier$outboundSchema.parse(allowlistIdentifier),
  );
}

export function allowlistIdentifierFromJSON(
  jsonString: string,
): SafeParseResult<AllowlistIdentifier, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => AllowlistIdentifier$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'AllowlistIdentifier' from JSON`,
  );
}
