/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

/**
 * Filter waitlist entries by their status
 */
export const ListWaitlistEntriesQueryParamStatus = {
  Pending: 'pending',
  Invited: 'invited',
  Completed: 'completed',
  Rejected: 'rejected',
} as const;
/**
 * Filter waitlist entries by their status
 */
export type ListWaitlistEntriesQueryParamStatus = ClosedEnum<typeof ListWaitlistEntriesQueryParamStatus>;

export type ListWaitlistEntriesRequest = {
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
  /**
   * Filter waitlist entries by `email_address` or `id`
   */
  query?: string | undefined;
  /**
   * Filter waitlist entries by their status
   */
  status?: ListWaitlistEntriesQueryParamStatus | undefined;
  /**
   * Specify the order of results. Supported values are:
   *
   * @remarks
   * - `created_at`
   * - `email_address`
   * - `invited_at`
   *
   * Use `+` for ascending or `-` for descending order. Defaults to `-created_at`.
   */
  orderBy?: string | undefined;
};

/** @internal */
export const ListWaitlistEntriesQueryParamStatus$inboundSchema: z.ZodNativeEnum<
  typeof ListWaitlistEntriesQueryParamStatus
> = z.nativeEnum(ListWaitlistEntriesQueryParamStatus);

/** @internal */
export const ListWaitlistEntriesQueryParamStatus$outboundSchema: z.ZodNativeEnum<
  typeof ListWaitlistEntriesQueryParamStatus
> = ListWaitlistEntriesQueryParamStatus$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListWaitlistEntriesQueryParamStatus$ {
  /** @deprecated use `ListWaitlistEntriesQueryParamStatus$inboundSchema` instead. */
  export const inboundSchema = ListWaitlistEntriesQueryParamStatus$inboundSchema;
  /** @deprecated use `ListWaitlistEntriesQueryParamStatus$outboundSchema` instead. */
  export const outboundSchema = ListWaitlistEntriesQueryParamStatus$outboundSchema;
}

/** @internal */
export const ListWaitlistEntriesRequest$inboundSchema: z.ZodType<ListWaitlistEntriesRequest, z.ZodTypeDef, unknown> = z
  .object({
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
    query: z.string().optional(),
    status: ListWaitlistEntriesQueryParamStatus$inboundSchema.optional(),
    order_by: z.string().default('-created_at'),
  })
  .transform(v => {
    return remap$(v, {
      order_by: 'orderBy',
    });
  });

/** @internal */
export type ListWaitlistEntriesRequest$Outbound = {
  limit: number;
  offset: number;
  query?: string | undefined;
  status?: string | undefined;
  order_by: string;
};

/** @internal */
export const ListWaitlistEntriesRequest$outboundSchema: z.ZodType<
  ListWaitlistEntriesRequest$Outbound,
  z.ZodTypeDef,
  ListWaitlistEntriesRequest
> = z
  .object({
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
    query: z.string().optional(),
    status: ListWaitlistEntriesQueryParamStatus$outboundSchema.optional(),
    orderBy: z.string().default('-created_at'),
  })
  .transform(v => {
    return remap$(v, {
      orderBy: 'order_by',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListWaitlistEntriesRequest$ {
  /** @deprecated use `ListWaitlistEntriesRequest$inboundSchema` instead. */
  export const inboundSchema = ListWaitlistEntriesRequest$inboundSchema;
  /** @deprecated use `ListWaitlistEntriesRequest$outboundSchema` instead. */
  export const outboundSchema = ListWaitlistEntriesRequest$outboundSchema;
  /** @deprecated use `ListWaitlistEntriesRequest$Outbound` instead. */
  export type Outbound = ListWaitlistEntriesRequest$Outbound;
}

export function listWaitlistEntriesRequestToJSON(listWaitlistEntriesRequest: ListWaitlistEntriesRequest): string {
  return JSON.stringify(ListWaitlistEntriesRequest$outboundSchema.parse(listWaitlistEntriesRequest));
}

export function listWaitlistEntriesRequestFromJSON(
  jsonString: string,
): SafeParseResult<ListWaitlistEntriesRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => ListWaitlistEntriesRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ListWaitlistEntriesRequest' from JSON`,
  );
}
