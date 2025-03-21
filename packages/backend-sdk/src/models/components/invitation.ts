/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export const InvitationObject = {
  Invitation: 'invitation',
} as const;
export type InvitationObject = ClosedEnum<typeof InvitationObject>;

export const InvitationStatus = {
  Pending: 'pending',
  Accepted: 'accepted',
  Revoked: 'revoked',
  Expired: 'expired',
} as const;
export type InvitationStatus = ClosedEnum<typeof InvitationStatus>;

/**
 * Success
 */
export type Invitation = {
  object: InvitationObject;
  id: string;
  emailAddress: string;
  publicMetadata: { [k: string]: any };
  revoked?: boolean | undefined;
  status: InvitationStatus;
  url?: string | undefined;
  /**
   * Unix timestamp of expiration.
   *
   * @remarks
   */
  expiresAt?: number | null | undefined;
  /**
   * Unix timestamp of creation.
   *
   * @remarks
   */
  createdAt: number;
  /**
   * Unix timestamp of last update.
   *
   * @remarks
   */
  updatedAt: number;
};

/** @internal */
export const InvitationObject$inboundSchema: z.ZodNativeEnum<typeof InvitationObject> = z.nativeEnum(InvitationObject);

/** @internal */
export const InvitationObject$outboundSchema: z.ZodNativeEnum<typeof InvitationObject> = InvitationObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace InvitationObject$ {
  /** @deprecated use `InvitationObject$inboundSchema` instead. */
  export const inboundSchema = InvitationObject$inboundSchema;
  /** @deprecated use `InvitationObject$outboundSchema` instead. */
  export const outboundSchema = InvitationObject$outboundSchema;
}

/** @internal */
export const InvitationStatus$inboundSchema: z.ZodNativeEnum<typeof InvitationStatus> = z.nativeEnum(InvitationStatus);

/** @internal */
export const InvitationStatus$outboundSchema: z.ZodNativeEnum<typeof InvitationStatus> = InvitationStatus$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace InvitationStatus$ {
  /** @deprecated use `InvitationStatus$inboundSchema` instead. */
  export const inboundSchema = InvitationStatus$inboundSchema;
  /** @deprecated use `InvitationStatus$outboundSchema` instead. */
  export const outboundSchema = InvitationStatus$outboundSchema;
}

/** @internal */
export const Invitation$inboundSchema: z.ZodType<Invitation, z.ZodTypeDef, unknown> = z
  .object({
    object: InvitationObject$inboundSchema,
    id: z.string(),
    email_address: z.string(),
    public_metadata: z.record(z.any()),
    revoked: z.boolean().optional(),
    status: InvitationStatus$inboundSchema,
    url: z.string().optional(),
    expires_at: z.nullable(z.number().int()).optional(),
    created_at: z.number().int(),
    updated_at: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      email_address: 'emailAddress',
      public_metadata: 'publicMetadata',
      expires_at: 'expiresAt',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    });
  });

/** @internal */
export type Invitation$Outbound = {
  object: string;
  id: string;
  email_address: string;
  public_metadata: { [k: string]: any };
  revoked?: boolean | undefined;
  status: string;
  url?: string | undefined;
  expires_at?: number | null | undefined;
  created_at: number;
  updated_at: number;
};

/** @internal */
export const Invitation$outboundSchema: z.ZodType<Invitation$Outbound, z.ZodTypeDef, Invitation> = z
  .object({
    object: InvitationObject$outboundSchema,
    id: z.string(),
    emailAddress: z.string(),
    publicMetadata: z.record(z.any()),
    revoked: z.boolean().optional(),
    status: InvitationStatus$outboundSchema,
    url: z.string().optional(),
    expiresAt: z.nullable(z.number().int()).optional(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      emailAddress: 'email_address',
      publicMetadata: 'public_metadata',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Invitation$ {
  /** @deprecated use `Invitation$inboundSchema` instead. */
  export const inboundSchema = Invitation$inboundSchema;
  /** @deprecated use `Invitation$outboundSchema` instead. */
  export const outboundSchema = Invitation$outboundSchema;
  /** @deprecated use `Invitation$Outbound` instead. */
  export type Outbound = Invitation$Outbound;
}

export function invitationToJSON(invitation: Invitation): string {
  return JSON.stringify(Invitation$outboundSchema.parse(invitation));
}

export function invitationFromJSON(jsonString: string): SafeParseResult<Invitation, SDKValidationError> {
  return safeParse(
    jsonString,
    x => Invitation$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'Invitation' from JSON`,
  );
}
