/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type GetSessionRequest = {
  /**
   * The ID of the session
   */
  sessionId: string;
};

/** @internal */
export const GetSessionRequest$inboundSchema: z.ZodType<GetSessionRequest, z.ZodTypeDef, unknown> = z
  .object({
    session_id: z.string(),
  })
  .transform(v => {
    return remap$(v, {
      session_id: 'sessionId',
    });
  });

/** @internal */
export type GetSessionRequest$Outbound = {
  session_id: string;
};

/** @internal */
export const GetSessionRequest$outboundSchema: z.ZodType<GetSessionRequest$Outbound, z.ZodTypeDef, GetSessionRequest> =
  z
    .object({
      sessionId: z.string(),
    })
    .transform(v => {
      return remap$(v, {
        sessionId: 'session_id',
      });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetSessionRequest$ {
  /** @deprecated use `GetSessionRequest$inboundSchema` instead. */
  export const inboundSchema = GetSessionRequest$inboundSchema;
  /** @deprecated use `GetSessionRequest$outboundSchema` instead. */
  export const outboundSchema = GetSessionRequest$outboundSchema;
  /** @deprecated use `GetSessionRequest$Outbound` instead. */
  export type Outbound = GetSessionRequest$Outbound;
}

export function getSessionRequestToJSON(getSessionRequest: GetSessionRequest): string {
  return JSON.stringify(GetSessionRequest$outboundSchema.parse(getSessionRequest));
}

export function getSessionRequestFromJSON(jsonString: string): SafeParseResult<GetSessionRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => GetSessionRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetSessionRequest' from JSON`,
  );
}
