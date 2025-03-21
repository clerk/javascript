/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';
import {
  OrganizationInvitationWithPublicOrganizationData,
  OrganizationInvitationWithPublicOrganizationData$inboundSchema,
  OrganizationInvitationWithPublicOrganizationData$Outbound,
  OrganizationInvitationWithPublicOrganizationData$outboundSchema,
} from './organizationinvitationwithpublicorganizationdata.js';

/**
 * A list of organization invitations with public organization data
 */
export type OrganizationInvitationsWithPublicOrganizationData = {
  data: Array<OrganizationInvitationWithPublicOrganizationData>;
  /**
   * Total number of organization invitations
   *
   * @remarks
   */
  totalCount: number;
};

/** @internal */
export const OrganizationInvitationsWithPublicOrganizationData$inboundSchema: z.ZodType<
  OrganizationInvitationsWithPublicOrganizationData,
  z.ZodTypeDef,
  unknown
> = z
  .object({
    data: z.array(OrganizationInvitationWithPublicOrganizationData$inboundSchema),
    total_count: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      total_count: 'totalCount',
    });
  });

/** @internal */
export type OrganizationInvitationsWithPublicOrganizationData$Outbound = {
  data: Array<OrganizationInvitationWithPublicOrganizationData$Outbound>;
  total_count: number;
};

/** @internal */
export const OrganizationInvitationsWithPublicOrganizationData$outboundSchema: z.ZodType<
  OrganizationInvitationsWithPublicOrganizationData$Outbound,
  z.ZodTypeDef,
  OrganizationInvitationsWithPublicOrganizationData
> = z
  .object({
    data: z.array(OrganizationInvitationWithPublicOrganizationData$outboundSchema),
    totalCount: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      totalCount: 'total_count',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationInvitationsWithPublicOrganizationData$ {
  /** @deprecated use `OrganizationInvitationsWithPublicOrganizationData$inboundSchema` instead. */
  export const inboundSchema = OrganizationInvitationsWithPublicOrganizationData$inboundSchema;
  /** @deprecated use `OrganizationInvitationsWithPublicOrganizationData$outboundSchema` instead. */
  export const outboundSchema = OrganizationInvitationsWithPublicOrganizationData$outboundSchema;
  /** @deprecated use `OrganizationInvitationsWithPublicOrganizationData$Outbound` instead. */
  export type Outbound = OrganizationInvitationsWithPublicOrganizationData$Outbound;
}

export function organizationInvitationsWithPublicOrganizationDataToJSON(
  organizationInvitationsWithPublicOrganizationData: OrganizationInvitationsWithPublicOrganizationData,
): string {
  return JSON.stringify(
    OrganizationInvitationsWithPublicOrganizationData$outboundSchema.parse(
      organizationInvitationsWithPublicOrganizationData,
    ),
  );
}

export function organizationInvitationsWithPublicOrganizationDataFromJSON(
  jsonString: string,
): SafeParseResult<OrganizationInvitationsWithPublicOrganizationData, SDKValidationError> {
  return safeParse(
    jsonString,
    x => OrganizationInvitationsWithPublicOrganizationData$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OrganizationInvitationsWithPublicOrganizationData' from JSON`,
  );
}
