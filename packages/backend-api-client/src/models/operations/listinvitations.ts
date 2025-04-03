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
 * Filter invitations based on their status
 */
export const ListInvitationsQueryParamStatus = {
  Pending: "pending",
  Accepted: "accepted",
  Revoked: "revoked",
  Expired: "expired",
} as const;
/**
 * Filter invitations based on their status
 */
export type ListInvitationsQueryParamStatus = ClosedEnum<
  typeof ListInvitationsQueryParamStatus
>;

export type ListInvitationsRequest = {
  /**
   * Filter invitations based on their status
   */
  status?: ListInvitationsQueryParamStatus | undefined;
  /**
   * Filter invitations based on their `email_address` or `id`
   */
  query?: string | undefined;
  /**
   * Allows to return organizations in a particular order.
   *
   * @remarks
   * At the moment, you can order the returned organizations either by their `name`, `created_at` or `members_count`.
   * In order to specify the direction, you can use the `+/-` symbols prepended in the property to order by.
   * For example, if you want organizations to be returned in descending order according to their `created_at` property, you can use `-created_at`.
   * If you don't use `+` or `-`, then `+` is implied.
   */
  orderBy?: string | undefined;
  /**
   * Whether to paginate the results.
   *
   * @remarks
   * If true, the results will be paginated.
   * If false, the results will not be paginated.
   */
  paginated?: boolean | undefined;
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
export const ListInvitationsQueryParamStatus$inboundSchema: z.ZodNativeEnum<
  typeof ListInvitationsQueryParamStatus
> = z.nativeEnum(ListInvitationsQueryParamStatus);

/** @internal */
export const ListInvitationsQueryParamStatus$outboundSchema: z.ZodNativeEnum<
  typeof ListInvitationsQueryParamStatus
> = ListInvitationsQueryParamStatus$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListInvitationsQueryParamStatus$ {
  /** @deprecated use `ListInvitationsQueryParamStatus$inboundSchema` instead. */
  export const inboundSchema = ListInvitationsQueryParamStatus$inboundSchema;
  /** @deprecated use `ListInvitationsQueryParamStatus$outboundSchema` instead. */
  export const outboundSchema = ListInvitationsQueryParamStatus$outboundSchema;
}

/** @internal */
export const ListInvitationsRequest$inboundSchema: z.ZodType<
  ListInvitationsRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  status: ListInvitationsQueryParamStatus$inboundSchema.optional(),
  query: z.string().optional(),
  order_by: z.string().optional(),
  paginated: z.boolean().optional(),
  limit: z.number().int().default(10),
  offset: z.number().int().default(0),
}).transform((v) => {
  return remap$(v, {
    "order_by": "orderBy",
  });
});

/** @internal */
export type ListInvitationsRequest$Outbound = {
  status?: string | undefined;
  query?: string | undefined;
  order_by?: string | undefined;
  paginated?: boolean | undefined;
  limit: number;
  offset: number;
};

/** @internal */
export const ListInvitationsRequest$outboundSchema: z.ZodType<
  ListInvitationsRequest$Outbound,
  z.ZodTypeDef,
  ListInvitationsRequest
> = z.object({
  status: ListInvitationsQueryParamStatus$outboundSchema.optional(),
  query: z.string().optional(),
  orderBy: z.string().optional(),
  paginated: z.boolean().optional(),
  limit: z.number().int().default(10),
  offset: z.number().int().default(0),
}).transform((v) => {
  return remap$(v, {
    orderBy: "order_by",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListInvitationsRequest$ {
  /** @deprecated use `ListInvitationsRequest$inboundSchema` instead. */
  export const inboundSchema = ListInvitationsRequest$inboundSchema;
  /** @deprecated use `ListInvitationsRequest$outboundSchema` instead. */
  export const outboundSchema = ListInvitationsRequest$outboundSchema;
  /** @deprecated use `ListInvitationsRequest$Outbound` instead. */
  export type Outbound = ListInvitationsRequest$Outbound;
}

export function listInvitationsRequestToJSON(
  listInvitationsRequest: ListInvitationsRequest,
): string {
  return JSON.stringify(
    ListInvitationsRequest$outboundSchema.parse(listInvitationsRequest),
  );
}

export function listInvitationsRequestFromJSON(
  jsonString: string,
): SafeParseResult<ListInvitationsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => ListInvitationsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ListInvitationsRequest' from JSON`,
  );
}
