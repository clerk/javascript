/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export const OrganizationObject = {
  Organization: 'organization',
} as const;
export type OrganizationObject = ClosedEnum<typeof OrganizationObject>;

export type Organization = {
  object: OrganizationObject;
  id: string;
  name: string;
  slug: string;
  membersCount?: number | undefined;
  missingMemberWithElevatedPermissions?: boolean | undefined;
  pendingInvitationsCount?: number | undefined;
  maxAllowedMemberships: number;
  adminDeleteEnabled: boolean;
  publicMetadata: { [k: string]: any };
  privateMetadata: { [k: string]: any };
  createdBy?: string | undefined;
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
export const OrganizationObject$inboundSchema: z.ZodNativeEnum<typeof OrganizationObject> =
  z.nativeEnum(OrganizationObject);

/** @internal */
export const OrganizationObject$outboundSchema: z.ZodNativeEnum<typeof OrganizationObject> =
  OrganizationObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationObject$ {
  /** @deprecated use `OrganizationObject$inboundSchema` instead. */
  export const inboundSchema = OrganizationObject$inboundSchema;
  /** @deprecated use `OrganizationObject$outboundSchema` instead. */
  export const outboundSchema = OrganizationObject$outboundSchema;
}

/** @internal */
export const Organization$inboundSchema: z.ZodType<Organization, z.ZodTypeDef, unknown> = z
  .object({
    object: OrganizationObject$inboundSchema,
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    members_count: z.number().int().optional(),
    missing_member_with_elevated_permissions: z.boolean().optional(),
    pending_invitations_count: z.number().int().optional(),
    max_allowed_memberships: z.number().int(),
    admin_delete_enabled: z.boolean(),
    public_metadata: z.record(z.any()),
    private_metadata: z.record(z.any()),
    created_by: z.string().optional(),
    created_at: z.number().int(),
    updated_at: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      members_count: 'membersCount',
      missing_member_with_elevated_permissions: 'missingMemberWithElevatedPermissions',
      pending_invitations_count: 'pendingInvitationsCount',
      max_allowed_memberships: 'maxAllowedMemberships',
      admin_delete_enabled: 'adminDeleteEnabled',
      public_metadata: 'publicMetadata',
      private_metadata: 'privateMetadata',
      created_by: 'createdBy',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    });
  });

/** @internal */
export type Organization$Outbound = {
  object: string;
  id: string;
  name: string;
  slug: string;
  members_count?: number | undefined;
  missing_member_with_elevated_permissions?: boolean | undefined;
  pending_invitations_count?: number | undefined;
  max_allowed_memberships: number;
  admin_delete_enabled: boolean;
  public_metadata: { [k: string]: any };
  private_metadata: { [k: string]: any };
  created_by?: string | undefined;
  created_at: number;
  updated_at: number;
};

/** @internal */
export const Organization$outboundSchema: z.ZodType<Organization$Outbound, z.ZodTypeDef, Organization> = z
  .object({
    object: OrganizationObject$outboundSchema,
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    membersCount: z.number().int().optional(),
    missingMemberWithElevatedPermissions: z.boolean().optional(),
    pendingInvitationsCount: z.number().int().optional(),
    maxAllowedMemberships: z.number().int(),
    adminDeleteEnabled: z.boolean(),
    publicMetadata: z.record(z.any()),
    privateMetadata: z.record(z.any()),
    createdBy: z.string().optional(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      membersCount: 'members_count',
      missingMemberWithElevatedPermissions: 'missing_member_with_elevated_permissions',
      pendingInvitationsCount: 'pending_invitations_count',
      maxAllowedMemberships: 'max_allowed_memberships',
      adminDeleteEnabled: 'admin_delete_enabled',
      publicMetadata: 'public_metadata',
      privateMetadata: 'private_metadata',
      createdBy: 'created_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Organization$ {
  /** @deprecated use `Organization$inboundSchema` instead. */
  export const inboundSchema = Organization$inboundSchema;
  /** @deprecated use `Organization$outboundSchema` instead. */
  export const outboundSchema = Organization$outboundSchema;
  /** @deprecated use `Organization$Outbound` instead. */
  export type Outbound = Organization$Outbound;
}

export function organizationToJSON(organization: Organization): string {
  return JSON.stringify(Organization$outboundSchema.parse(organization));
}

export function organizationFromJSON(jsonString: string): SafeParseResult<Organization, SDKValidationError> {
  return safeParse(
    jsonString,
    x => Organization$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'Organization' from JSON`,
  );
}
