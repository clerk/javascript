/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type ListAllowlistIdentifiersRequest = {
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
export const ListAllowlistIdentifiersRequest$inboundSchema: z.ZodType<
  ListAllowlistIdentifiersRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  paginated: z.boolean().optional(),
  limit: z.number().int().default(10),
  offset: z.number().int().default(0),
});

/** @internal */
export type ListAllowlistIdentifiersRequest$Outbound = {
  paginated?: boolean | undefined;
  limit: number;
  offset: number;
};

/** @internal */
export const ListAllowlistIdentifiersRequest$outboundSchema: z.ZodType<
  ListAllowlistIdentifiersRequest$Outbound,
  z.ZodTypeDef,
  ListAllowlistIdentifiersRequest
> = z.object({
  paginated: z.boolean().optional(),
  limit: z.number().int().default(10),
  offset: z.number().int().default(0),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListAllowlistIdentifiersRequest$ {
  /** @deprecated use `ListAllowlistIdentifiersRequest$inboundSchema` instead. */
  export const inboundSchema = ListAllowlistIdentifiersRequest$inboundSchema;
  /** @deprecated use `ListAllowlistIdentifiersRequest$outboundSchema` instead. */
  export const outboundSchema = ListAllowlistIdentifiersRequest$outboundSchema;
  /** @deprecated use `ListAllowlistIdentifiersRequest$Outbound` instead. */
  export type Outbound = ListAllowlistIdentifiersRequest$Outbound;
}

export function listAllowlistIdentifiersRequestToJSON(
  listAllowlistIdentifiersRequest: ListAllowlistIdentifiersRequest,
): string {
  return JSON.stringify(
    ListAllowlistIdentifiersRequest$outboundSchema.parse(
      listAllowlistIdentifiersRequest,
    ),
  );
}

export function listAllowlistIdentifiersRequestFromJSON(
  jsonString: string,
): SafeParseResult<ListAllowlistIdentifiersRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => ListAllowlistIdentifiersRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ListAllowlistIdentifiersRequest' from JSON`,
  );
}
