/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  OrganizationMembershipPublicUserData,
  OrganizationMembershipPublicUserData$inboundSchema,
  OrganizationMembershipPublicUserData$Outbound,
  OrganizationMembershipPublicUserData$outboundSchema,
} from "./organizationmembershippublicuserdata.js";

/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export const OrganizationMembershipObject = {
  OrganizationMembership: "organization_membership",
} as const;
/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export type OrganizationMembershipObject = ClosedEnum<
  typeof OrganizationMembershipObject
>;

export const OrganizationMembershipOrganizationObject = {
  Organization: "organization",
} as const;
export type OrganizationMembershipOrganizationObject = ClosedEnum<
  typeof OrganizationMembershipOrganizationObject
>;

export type OrganizationMembershipOrganization = {
  object: OrganizationMembershipOrganizationObject;
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

/**
 * Hello world
 */
export type OrganizationMembership = {
  id: string;
  /**
   * String representing the object's type. Objects of the same type share the same value.
   *
   * @remarks
   */
  object: OrganizationMembershipObject;
  role: string;
  roleName?: string | undefined;
  permissions: Array<string>;
  /**
   * Metadata saved on the organization membership, accessible from both Frontend and Backend APIs
   */
  publicMetadata: { [k: string]: any };
  /**
   * Metadata saved on the organization membership, accessible only from the Backend API
   */
  privateMetadata?: { [k: string]: any } | undefined;
  organization: OrganizationMembershipOrganization;
  /**
   * An organization membership with public user data populated
   */
  publicUserData?: OrganizationMembershipPublicUserData | undefined;
  /**
   * Unix timestamp of creation.
   */
  createdAt: number;
  /**
   * Unix timestamp of last update.
   */
  updatedAt: number;
};

/** @internal */
export const OrganizationMembershipObject$inboundSchema: z.ZodNativeEnum<
  typeof OrganizationMembershipObject
> = z.nativeEnum(OrganizationMembershipObject);

/** @internal */
export const OrganizationMembershipObject$outboundSchema: z.ZodNativeEnum<
  typeof OrganizationMembershipObject
> = OrganizationMembershipObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationMembershipObject$ {
  /** @deprecated use `OrganizationMembershipObject$inboundSchema` instead. */
  export const inboundSchema = OrganizationMembershipObject$inboundSchema;
  /** @deprecated use `OrganizationMembershipObject$outboundSchema` instead. */
  export const outboundSchema = OrganizationMembershipObject$outboundSchema;
}

/** @internal */
export const OrganizationMembershipOrganizationObject$inboundSchema:
  z.ZodNativeEnum<typeof OrganizationMembershipOrganizationObject> = z
    .nativeEnum(OrganizationMembershipOrganizationObject);

/** @internal */
export const OrganizationMembershipOrganizationObject$outboundSchema:
  z.ZodNativeEnum<typeof OrganizationMembershipOrganizationObject> =
    OrganizationMembershipOrganizationObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationMembershipOrganizationObject$ {
  /** @deprecated use `OrganizationMembershipOrganizationObject$inboundSchema` instead. */
  export const inboundSchema =
    OrganizationMembershipOrganizationObject$inboundSchema;
  /** @deprecated use `OrganizationMembershipOrganizationObject$outboundSchema` instead. */
  export const outboundSchema =
    OrganizationMembershipOrganizationObject$outboundSchema;
}

/** @internal */
export const OrganizationMembershipOrganization$inboundSchema: z.ZodType<
  OrganizationMembershipOrganization,
  z.ZodTypeDef,
  unknown
> = z.object({
  object: OrganizationMembershipOrganizationObject$inboundSchema,
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
}).transform((v) => {
  return remap$(v, {
    "members_count": "membersCount",
    "missing_member_with_elevated_permissions":
      "missingMemberWithElevatedPermissions",
    "pending_invitations_count": "pendingInvitationsCount",
    "max_allowed_memberships": "maxAllowedMemberships",
    "admin_delete_enabled": "adminDeleteEnabled",
    "public_metadata": "publicMetadata",
    "private_metadata": "privateMetadata",
    "created_by": "createdBy",
    "created_at": "createdAt",
    "updated_at": "updatedAt",
  });
});

/** @internal */
export type OrganizationMembershipOrganization$Outbound = {
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
export const OrganizationMembershipOrganization$outboundSchema: z.ZodType<
  OrganizationMembershipOrganization$Outbound,
  z.ZodTypeDef,
  OrganizationMembershipOrganization
> = z.object({
  object: OrganizationMembershipOrganizationObject$outboundSchema,
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
}).transform((v) => {
  return remap$(v, {
    membersCount: "members_count",
    missingMemberWithElevatedPermissions:
      "missing_member_with_elevated_permissions",
    pendingInvitationsCount: "pending_invitations_count",
    maxAllowedMemberships: "max_allowed_memberships",
    adminDeleteEnabled: "admin_delete_enabled",
    publicMetadata: "public_metadata",
    privateMetadata: "private_metadata",
    createdBy: "created_by",
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationMembershipOrganization$ {
  /** @deprecated use `OrganizationMembershipOrganization$inboundSchema` instead. */
  export const inboundSchema = OrganizationMembershipOrganization$inboundSchema;
  /** @deprecated use `OrganizationMembershipOrganization$outboundSchema` instead. */
  export const outboundSchema =
    OrganizationMembershipOrganization$outboundSchema;
  /** @deprecated use `OrganizationMembershipOrganization$Outbound` instead. */
  export type Outbound = OrganizationMembershipOrganization$Outbound;
}

export function organizationMembershipOrganizationToJSON(
  organizationMembershipOrganization: OrganizationMembershipOrganization,
): string {
  return JSON.stringify(
    OrganizationMembershipOrganization$outboundSchema.parse(
      organizationMembershipOrganization,
    ),
  );
}

export function organizationMembershipOrganizationFromJSON(
  jsonString: string,
): SafeParseResult<OrganizationMembershipOrganization, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      OrganizationMembershipOrganization$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OrganizationMembershipOrganization' from JSON`,
  );
}

/** @internal */
export const OrganizationMembership$inboundSchema: z.ZodType<
  OrganizationMembership,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.string(),
  object: OrganizationMembershipObject$inboundSchema,
  role: z.string(),
  role_name: z.string().optional(),
  permissions: z.array(z.string()),
  public_metadata: z.record(z.any()),
  private_metadata: z.record(z.any()).optional(),
  organization: z.lazy(() => OrganizationMembershipOrganization$inboundSchema),
  public_user_data: OrganizationMembershipPublicUserData$inboundSchema
    .optional(),
  created_at: z.number().int(),
  updated_at: z.number().int(),
}).transform((v) => {
  return remap$(v, {
    "role_name": "roleName",
    "public_metadata": "publicMetadata",
    "private_metadata": "privateMetadata",
    "public_user_data": "publicUserData",
    "created_at": "createdAt",
    "updated_at": "updatedAt",
  });
});

/** @internal */
export type OrganizationMembership$Outbound = {
  id: string;
  object: string;
  role: string;
  role_name?: string | undefined;
  permissions: Array<string>;
  public_metadata: { [k: string]: any };
  private_metadata?: { [k: string]: any } | undefined;
  organization: OrganizationMembershipOrganization$Outbound;
  public_user_data?: OrganizationMembershipPublicUserData$Outbound | undefined;
  created_at: number;
  updated_at: number;
};

/** @internal */
export const OrganizationMembership$outboundSchema: z.ZodType<
  OrganizationMembership$Outbound,
  z.ZodTypeDef,
  OrganizationMembership
> = z.object({
  id: z.string(),
  object: OrganizationMembershipObject$outboundSchema,
  role: z.string(),
  roleName: z.string().optional(),
  permissions: z.array(z.string()),
  publicMetadata: z.record(z.any()),
  privateMetadata: z.record(z.any()).optional(),
  organization: z.lazy(() => OrganizationMembershipOrganization$outboundSchema),
  publicUserData: OrganizationMembershipPublicUserData$outboundSchema
    .optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
}).transform((v) => {
  return remap$(v, {
    roleName: "role_name",
    publicMetadata: "public_metadata",
    privateMetadata: "private_metadata",
    publicUserData: "public_user_data",
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationMembership$ {
  /** @deprecated use `OrganizationMembership$inboundSchema` instead. */
  export const inboundSchema = OrganizationMembership$inboundSchema;
  /** @deprecated use `OrganizationMembership$outboundSchema` instead. */
  export const outboundSchema = OrganizationMembership$outboundSchema;
  /** @deprecated use `OrganizationMembership$Outbound` instead. */
  export type Outbound = OrganizationMembership$Outbound;
}

export function organizationMembershipToJSON(
  organizationMembership: OrganizationMembership,
): string {
  return JSON.stringify(
    OrganizationMembership$outboundSchema.parse(organizationMembership),
  );
}

export function organizationMembershipFromJSON(
  jsonString: string,
): SafeParseResult<OrganizationMembership, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => OrganizationMembership$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OrganizationMembership' from JSON`,
  );
}
