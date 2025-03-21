/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type ListOrganizationsRequest = {
  /**
   * Flag to denote whether the member counts of each organization should be included in the response or not.
   */
  includeMembersCount?: boolean | undefined;
  /**
   * Flag to denote whether or not to include a member with elevated permissions who is not currently a member of the organization.
   */
  includeMissingMemberWithElevatedPermissions?: boolean | undefined;
  /**
   * Returns organizations with ID, name, or slug that match the given query.
   *
   * @remarks
   * Uses exact match for organization ID and partial match for name and slug.
   */
  query?: string | undefined;
  /**
   * Returns organizations with the user ids specified. Any user ids not found are ignored.
   *
   * @remarks
   * For each user id, the `+` and `-` can be prepended to the id, which denote whether the
   * respective organization should be included or excluded from the result set.
   */
  userId?: Array<string> | undefined;
  /**
   * Returns organizations with the organization ids specified. Any organization ids not found are ignored.
   *
   * @remarks
   * For each organization id, the `+` and `-` can be prepended to the id, which denote whether the
   * respective organization should be included or excluded from the result set. Accepts up to 100 organization ids.
   * Example: ?organization_id=+org_1&organization_id=-org_2
   */
  organizationId?: Array<string> | undefined;
  /**
   * Allows to return organizations in a particular order.
   *
   * @remarks
   * At the moment, you can order the returned organizations either by their `name`, `created_at` or `members_count`.
   * In order to specify the direction, you can use the `+/-` symbols prepended in the property to order by.
   * For example, if you want organizations to be returned in descending order according to their `created_at` property, you can use `-created_at`.
   * If you don't use `+` or `-`, then `+` is implied.
   * Defaults to `-created_at`.
   */
  orderBy?: string | undefined;
  /**
   * Applies a limit to the number of results returned.
   *
   * @remarks
   * Can be used for paginating the results together with `offset`.
   */
  limit?: number | undefined;
  /**
   * Skip the first `offset` results when paginating.
   *
   * @remarks
   * Needs to be an integer greater or equal to zero.
   * To be used in conjunction with `limit`.
   */
  offset?: number | undefined;
};

/** @internal */
export const ListOrganizationsRequest$inboundSchema: z.ZodType<ListOrganizationsRequest, z.ZodTypeDef, unknown> = z
  .object({
    include_members_count: z.boolean().optional(),
    include_missing_member_with_elevated_permissions: z.boolean().optional(),
    query: z.string().optional(),
    user_id: z.array(z.string()).optional(),
    organization_id: z.array(z.string()).optional(),
    order_by: z.string().default('-created_at'),
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
  })
  .transform(v => {
    return remap$(v, {
      include_members_count: 'includeMembersCount',
      include_missing_member_with_elevated_permissions: 'includeMissingMemberWithElevatedPermissions',
      user_id: 'userId',
      organization_id: 'organizationId',
      order_by: 'orderBy',
    });
  });

/** @internal */
export type ListOrganizationsRequest$Outbound = {
  include_members_count?: boolean | undefined;
  include_missing_member_with_elevated_permissions?: boolean | undefined;
  query?: string | undefined;
  user_id?: Array<string> | undefined;
  organization_id?: Array<string> | undefined;
  order_by: string;
  limit: number;
  offset: number;
};

/** @internal */
export const ListOrganizationsRequest$outboundSchema: z.ZodType<
  ListOrganizationsRequest$Outbound,
  z.ZodTypeDef,
  ListOrganizationsRequest
> = z
  .object({
    includeMembersCount: z.boolean().optional(),
    includeMissingMemberWithElevatedPermissions: z.boolean().optional(),
    query: z.string().optional(),
    userId: z.array(z.string()).optional(),
    organizationId: z.array(z.string()).optional(),
    orderBy: z.string().default('-created_at'),
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
  })
  .transform(v => {
    return remap$(v, {
      includeMembersCount: 'include_members_count',
      includeMissingMemberWithElevatedPermissions: 'include_missing_member_with_elevated_permissions',
      userId: 'user_id',
      organizationId: 'organization_id',
      orderBy: 'order_by',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListOrganizationsRequest$ {
  /** @deprecated use `ListOrganizationsRequest$inboundSchema` instead. */
  export const inboundSchema = ListOrganizationsRequest$inboundSchema;
  /** @deprecated use `ListOrganizationsRequest$outboundSchema` instead. */
  export const outboundSchema = ListOrganizationsRequest$outboundSchema;
  /** @deprecated use `ListOrganizationsRequest$Outbound` instead. */
  export type Outbound = ListOrganizationsRequest$Outbound;
}

export function listOrganizationsRequestToJSON(listOrganizationsRequest: ListOrganizationsRequest): string {
  return JSON.stringify(ListOrganizationsRequest$outboundSchema.parse(listOrganizationsRequest));
}

export function listOrganizationsRequestFromJSON(
  jsonString: string,
): SafeParseResult<ListOrganizationsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => ListOrganizationsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ListOrganizationsRequest' from JSON`,
  );
}
