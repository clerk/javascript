/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export type ListOrganizationMembershipsRequest = {
  /**
   * The organization ID.
   */
  organizationId: string;
  /**
   * Sorts organizations memberships by phone_number, email_address, created_at, first_name, last_name or username.
   *
   * @remarks
   * By prepending one of those values with + or -, we can choose to sort in ascending (ASC) or descending (DESC) order."
   */
  orderBy?: string | undefined;
  /**
   * Returns users with the user ids specified. For each user id, the `+` and `-` can be
   *
   * @remarks
   * prepended to the id, which denote whether the respective user id should be included or
   * excluded from the result set. Accepts up to 100 user ids. Any user ids not found are ignored.
   */
  userId?: Array<string> | undefined;
  /**
   * Returns users with the specified email addresses. Accepts up to 100 email addresses. Any email addresses not found are ignored.
   */
  emailAddress?: Array<string> | undefined;
  /**
   * Returns users with the specified phone numbers. Accepts up to 100 phone numbers. Any phone numbers not found are ignored.
   */
  phoneNumber?: Array<string> | undefined;
  /**
   * Returns users with the specified usernames.
   *
   * @remarks
   * Accepts up to 100 usernames.
   * Any usernames not found are ignored.
   */
  username?: Array<string> | undefined;
  /**
   * Returns users with the specified web3 wallet addresses.
   *
   * @remarks
   * Accepts up to 100 web3 wallet addresses.
   * Any web3 wallet addressed not found are ignored.
   */
  web3Wallet?: Array<string> | undefined;
  /**
   * Returns users with the specified roles. Accepts up to 100 roles. Any roles not found are ignored.
   */
  role?: Array<string> | undefined;
  /**
   * Returns users that match the given query.
   *
   * @remarks
   * For possible matches, we check the email addresses, phone numbers, usernames, web3 wallets, user ids, first and last names.
   * The query value doesn't need to match the exact value you are looking for, it is capable of partial matches as well.
   */
  query?: string | undefined;
  /**
   * Returns users with emails that match the given query, via case-insensitive partial match.
   *
   * @remarks
   * For example, `email_address_query=ello` will match a user with the email `HELLO@example.com`.
   */
  emailAddressQuery?: string | undefined;
  /**
   * Returns users with phone numbers that match the given query, via case-insensitive partial match.
   *
   * @remarks
   * For example, `phone_number_query=555` will match a user with the phone number `+1555xxxxxxx`.
   */
  phoneNumberQuery?: string | undefined;
  /**
   * Returns users with usernames that match the given query, via case-insensitive partial match.
   *
   * @remarks
   * For example, `username_query=CoolUser` will match a user with the username `SomeCoolUser`.
   */
  usernameQuery?: string | undefined;
  /**
   * Returns users with names that match the given query, via case-insensitive partial match.
   */
  nameQuery?: string | undefined;
  /**
   * Returns users whose last session activity was before the given date (with millisecond precision).
   *
   * @remarks
   * Example: use 1700690400000 to retrieve users whose last session activity was before 2023-11-23.
   */
  lastActiveAtBefore?: number | undefined;
  /**
   * Returns users whose last session activity was after the given date (with millisecond precision).
   *
   * @remarks
   * Example: use 1700690400000 to retrieve users whose last session activity was after 2023-11-23.
   */
  lastActiveAtAfter?: number | undefined;
  /**
   * Returns users who have been created before the given date (with millisecond precision).
   *
   * @remarks
   * Example: use 1730160000000 to retrieve users who have been created before 2024-10-29.
   */
  createdAtBefore?: number | undefined;
  /**
   * Returns users who have been created after the given date (with millisecond precision).
   *
   * @remarks
   * Example: use 1730160000000 to retrieve users who have been created after 2024-10-29.
   */
  createdAtAfter?: number | undefined;
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
export const ListOrganizationMembershipsRequest$inboundSchema: z.ZodType<
  ListOrganizationMembershipsRequest,
  z.ZodTypeDef,
  unknown
> = z
  .object({
    organization_id: z.string(),
    order_by: z.string().optional(),
    user_id: z.array(z.string()).optional(),
    email_address: z.array(z.string()).optional(),
    phone_number: z.array(z.string()).optional(),
    username: z.array(z.string()).optional(),
    web3_wallet: z.array(z.string()).optional(),
    role: z.array(z.string()).optional(),
    query: z.string().optional(),
    email_address_query: z.string().optional(),
    phone_number_query: z.string().optional(),
    username_query: z.string().optional(),
    name_query: z.string().optional(),
    last_active_at_before: z.number().int().optional(),
    last_active_at_after: z.number().int().optional(),
    created_at_before: z.number().int().optional(),
    created_at_after: z.number().int().optional(),
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
  })
  .transform(v => {
    return remap$(v, {
      organization_id: 'organizationId',
      order_by: 'orderBy',
      user_id: 'userId',
      email_address: 'emailAddress',
      phone_number: 'phoneNumber',
      web3_wallet: 'web3Wallet',
      email_address_query: 'emailAddressQuery',
      phone_number_query: 'phoneNumberQuery',
      username_query: 'usernameQuery',
      name_query: 'nameQuery',
      last_active_at_before: 'lastActiveAtBefore',
      last_active_at_after: 'lastActiveAtAfter',
      created_at_before: 'createdAtBefore',
      created_at_after: 'createdAtAfter',
    });
  });

/** @internal */
export type ListOrganizationMembershipsRequest$Outbound = {
  organization_id: string;
  order_by?: string | undefined;
  user_id?: Array<string> | undefined;
  email_address?: Array<string> | undefined;
  phone_number?: Array<string> | undefined;
  username?: Array<string> | undefined;
  web3_wallet?: Array<string> | undefined;
  role?: Array<string> | undefined;
  query?: string | undefined;
  email_address_query?: string | undefined;
  phone_number_query?: string | undefined;
  username_query?: string | undefined;
  name_query?: string | undefined;
  last_active_at_before?: number | undefined;
  last_active_at_after?: number | undefined;
  created_at_before?: number | undefined;
  created_at_after?: number | undefined;
  limit: number;
  offset: number;
};

/** @internal */
export const ListOrganizationMembershipsRequest$outboundSchema: z.ZodType<
  ListOrganizationMembershipsRequest$Outbound,
  z.ZodTypeDef,
  ListOrganizationMembershipsRequest
> = z
  .object({
    organizationId: z.string(),
    orderBy: z.string().optional(),
    userId: z.array(z.string()).optional(),
    emailAddress: z.array(z.string()).optional(),
    phoneNumber: z.array(z.string()).optional(),
    username: z.array(z.string()).optional(),
    web3Wallet: z.array(z.string()).optional(),
    role: z.array(z.string()).optional(),
    query: z.string().optional(),
    emailAddressQuery: z.string().optional(),
    phoneNumberQuery: z.string().optional(),
    usernameQuery: z.string().optional(),
    nameQuery: z.string().optional(),
    lastActiveAtBefore: z.number().int().optional(),
    lastActiveAtAfter: z.number().int().optional(),
    createdAtBefore: z.number().int().optional(),
    createdAtAfter: z.number().int().optional(),
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
  })
  .transform(v => {
    return remap$(v, {
      organizationId: 'organization_id',
      orderBy: 'order_by',
      userId: 'user_id',
      emailAddress: 'email_address',
      phoneNumber: 'phone_number',
      web3Wallet: 'web3_wallet',
      emailAddressQuery: 'email_address_query',
      phoneNumberQuery: 'phone_number_query',
      usernameQuery: 'username_query',
      nameQuery: 'name_query',
      lastActiveAtBefore: 'last_active_at_before',
      lastActiveAtAfter: 'last_active_at_after',
      createdAtBefore: 'created_at_before',
      createdAtAfter: 'created_at_after',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListOrganizationMembershipsRequest$ {
  /** @deprecated use `ListOrganizationMembershipsRequest$inboundSchema` instead. */
  export const inboundSchema = ListOrganizationMembershipsRequest$inboundSchema;
  /** @deprecated use `ListOrganizationMembershipsRequest$outboundSchema` instead. */
  export const outboundSchema = ListOrganizationMembershipsRequest$outboundSchema;
  /** @deprecated use `ListOrganizationMembershipsRequest$Outbound` instead. */
  export type Outbound = ListOrganizationMembershipsRequest$Outbound;
}

export function listOrganizationMembershipsRequestToJSON(
  listOrganizationMembershipsRequest: ListOrganizationMembershipsRequest,
): string {
  return JSON.stringify(ListOrganizationMembershipsRequest$outboundSchema.parse(listOrganizationMembershipsRequest));
}

export function listOrganizationMembershipsRequestFromJSON(
  jsonString: string,
): SafeParseResult<ListOrganizationMembershipsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    x => ListOrganizationMembershipsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ListOrganizationMembershipsRequest' from JSON`,
  );
}
