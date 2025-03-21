/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type DeletePhoneNumberRequest = {
  /**
   * The ID of the phone number to delete
   */
  phoneNumberId: string;
};

/** @internal */
export const DeletePhoneNumberRequest$inboundSchema: z.ZodType<DeletePhoneNumberRequest, z.ZodTypeDef, unknown> = z
  .object({
    phone_number_id: z.string(),
  })
  .transform(v => {
    return remap$(v, {
      phone_number_id: 'phoneNumberId',
    });
  });

/** @internal */
export type DeletePhoneNumberRequest$Outbound = {
  phone_number_id: string;
};

/** @internal */
export const DeletePhoneNumberRequest$outboundSchema: z.ZodType<
  DeletePhoneNumberRequest$Outbound,
  z.ZodTypeDef,
  DeletePhoneNumberRequest
> = z
  .object({
    phoneNumberId: z.string(),
  })
  .transform(v => {
    return remap$(v, {
      phoneNumberId: 'phone_number_id',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace DeletePhoneNumberRequest$ {
  /** @deprecated use `DeletePhoneNumberRequest$inboundSchema` instead. */
  export const inboundSchema = DeletePhoneNumberRequest$inboundSchema;
  /** @deprecated use `DeletePhoneNumberRequest$outboundSchema` instead. */
  export const outboundSchema = DeletePhoneNumberRequest$outboundSchema;
  /** @deprecated use `DeletePhoneNumberRequest$Outbound` instead. */
  export type Outbound = DeletePhoneNumberRequest$Outbound;
}

export function deletePhoneNumberRequestToJSON(deletePhoneNumberRequest: DeletePhoneNumberRequest): string {
  return JSON.stringify(DeletePhoneNumberRequest$outboundSchema.parse(deletePhoneNumberRequest));
}

export function deletePhoneNumberRequestFromJSON(
  jsonString: string,
): SafeParseResult<DeletePhoneNumberRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => DeletePhoneNumberRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'DeletePhoneNumberRequest' from JSON`,
  );
}
