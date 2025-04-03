/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type UpdateUserMetadataRequestBody = {
  /**
   * Metadata saved on the user, that is visible to both your frontend and backend.
   *
   * @remarks
   * The new object will be merged with the existing value.
   */
  publicMetadata?: { [k: string]: any } | undefined;
  /**
   * Metadata saved on the user that is only visible to your backend.
   *
   * @remarks
   * The new object will be merged with the existing value.
   */
  privateMetadata?: { [k: string]: any } | undefined;
  /**
   * Metadata saved on the user, that can be updated from both the Frontend and Backend APIs.
   *
   * @remarks
   * The new object will be merged with the existing value.
   *
   * Note: Since this data can be modified from the frontend, it is not guaranteed to be safe.
   */
  unsafeMetadata?: { [k: string]: any } | undefined;
};

export type UpdateUserMetadataRequest = {
  /**
   * The ID of the user whose metadata will be updated and merged
   */
  userId: string;
  requestBody?: UpdateUserMetadataRequestBody | undefined;
};

/** @internal */
export const UpdateUserMetadataRequestBody$inboundSchema: z.ZodType<
  UpdateUserMetadataRequestBody,
  z.ZodTypeDef,
  unknown
> = z.object({
  public_metadata: z.record(z.any()).optional(),
  private_metadata: z.record(z.any()).optional(),
  unsafe_metadata: z.record(z.any()).optional(),
}).transform((v) => {
  return remap$(v, {
    "public_metadata": "publicMetadata",
    "private_metadata": "privateMetadata",
    "unsafe_metadata": "unsafeMetadata",
  });
});

/** @internal */
export type UpdateUserMetadataRequestBody$Outbound = {
  public_metadata?: { [k: string]: any } | undefined;
  private_metadata?: { [k: string]: any } | undefined;
  unsafe_metadata?: { [k: string]: any } | undefined;
};

/** @internal */
export const UpdateUserMetadataRequestBody$outboundSchema: z.ZodType<
  UpdateUserMetadataRequestBody$Outbound,
  z.ZodTypeDef,
  UpdateUserMetadataRequestBody
> = z.object({
  publicMetadata: z.record(z.any()).optional(),
  privateMetadata: z.record(z.any()).optional(),
  unsafeMetadata: z.record(z.any()).optional(),
}).transform((v) => {
  return remap$(v, {
    publicMetadata: "public_metadata",
    privateMetadata: "private_metadata",
    unsafeMetadata: "unsafe_metadata",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateUserMetadataRequestBody$ {
  /** @deprecated use `UpdateUserMetadataRequestBody$inboundSchema` instead. */
  export const inboundSchema = UpdateUserMetadataRequestBody$inboundSchema;
  /** @deprecated use `UpdateUserMetadataRequestBody$outboundSchema` instead. */
  export const outboundSchema = UpdateUserMetadataRequestBody$outboundSchema;
  /** @deprecated use `UpdateUserMetadataRequestBody$Outbound` instead. */
  export type Outbound = UpdateUserMetadataRequestBody$Outbound;
}

export function updateUserMetadataRequestBodyToJSON(
  updateUserMetadataRequestBody: UpdateUserMetadataRequestBody,
): string {
  return JSON.stringify(
    UpdateUserMetadataRequestBody$outboundSchema.parse(
      updateUserMetadataRequestBody,
    ),
  );
}

export function updateUserMetadataRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<UpdateUserMetadataRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => UpdateUserMetadataRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateUserMetadataRequestBody' from JSON`,
  );
}

/** @internal */
export const UpdateUserMetadataRequest$inboundSchema: z.ZodType<
  UpdateUserMetadataRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  user_id: z.string(),
  RequestBody: z.lazy(() => UpdateUserMetadataRequestBody$inboundSchema)
    .optional(),
}).transform((v) => {
  return remap$(v, {
    "user_id": "userId",
    "RequestBody": "requestBody",
  });
});

/** @internal */
export type UpdateUserMetadataRequest$Outbound = {
  user_id: string;
  RequestBody?: UpdateUserMetadataRequestBody$Outbound | undefined;
};

/** @internal */
export const UpdateUserMetadataRequest$outboundSchema: z.ZodType<
  UpdateUserMetadataRequest$Outbound,
  z.ZodTypeDef,
  UpdateUserMetadataRequest
> = z.object({
  userId: z.string(),
  requestBody: z.lazy(() => UpdateUserMetadataRequestBody$outboundSchema)
    .optional(),
}).transform((v) => {
  return remap$(v, {
    userId: "user_id",
    requestBody: "RequestBody",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateUserMetadataRequest$ {
  /** @deprecated use `UpdateUserMetadataRequest$inboundSchema` instead. */
  export const inboundSchema = UpdateUserMetadataRequest$inboundSchema;
  /** @deprecated use `UpdateUserMetadataRequest$outboundSchema` instead. */
  export const outboundSchema = UpdateUserMetadataRequest$outboundSchema;
  /** @deprecated use `UpdateUserMetadataRequest$Outbound` instead. */
  export type Outbound = UpdateUserMetadataRequest$Outbound;
}

export function updateUserMetadataRequestToJSON(
  updateUserMetadataRequest: UpdateUserMetadataRequest,
): string {
  return JSON.stringify(
    UpdateUserMetadataRequest$outboundSchema.parse(updateUserMetadataRequest),
  );
}

export function updateUserMetadataRequestFromJSON(
  jsonString: string,
): SafeParseResult<UpdateUserMetadataRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => UpdateUserMetadataRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateUserMetadataRequest' from JSON`,
  );
}
