import type { EmailLinkErrorCodeStatus } from '../../error';
import { CLERK_NETLIFY_CACHE_BUST_PARAM } from '../../netlifyCacheHandler';
import { CLERK_SATELLITE_URL, CLERK_SUFFIXED_COOKIES, CLERK_SYNCED } from './constants';

const _ClerkQueryParams = [
  '__clerk_status',
  '__clerk_created_session',
  '__clerk_invitation_token',
  '__clerk_ticket',
  '__clerk_modal_state',
  '__clerk_handshake',
  '__clerk_handshake_nonce',
  '__clerk_help',
  CLERK_NETLIFY_CACHE_BUST_PARAM,
  CLERK_SYNCED,
  CLERK_SATELLITE_URL,
  CLERK_SUFFIXED_COOKIES,
] as const;

type ClerkQueryParam = (typeof _ClerkQueryParams)[number];

/**
 * Used for email link verification
 */
export type VerifyTokenStatus = 'verified' | (typeof EmailLinkErrorCodeStatus)[keyof typeof EmailLinkErrorCodeStatus];

/**
 * Used for instance invitations and organization invitations
 */
type TicketStatus = 'sign_in' | 'sign_up' | 'complete';

type ClerkQueryParamsToValuesMap = {
  __clerk_status: TicketStatus | VerifyTokenStatus;
} & Record<(typeof _ClerkQueryParams)[number], string>;

/**
 *
 */
export function getClerkQueryParam<T extends ClerkQueryParam>(param: T): ClerkQueryParamsToValuesMap[T] | null {
  const val = new URL(window.location.href).searchParams.get(param);
  return val ? (val as ClerkQueryParamsToValuesMap[T]) : null;
}

/**
 *
 */
export function removeClerkQueryParam<T extends ClerkQueryParam>(param: T) {
  const url = new URL(window.location.href);
  if (url.searchParams.has(param)) {
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, '', url);
  }
  return;
}

/**
 * Extracts and forwards Clerk query parameters from the current URL to a new URLSearchParams object.
 * This is useful when navigating between pages while preserving Clerk-specific query parameters.
 *
 * @param params - Optional URLSearchParams object to add the parameters to. If not provided, a new one will be created.
 * @returns A URLSearchParams object containing the forwarded Clerk parameters
 */
export function forwardClerkQueryParams(params?: URLSearchParams): URLSearchParams {
  const currentSearchParams = new URLSearchParams(window.location.search);
  const newParams = params || new URLSearchParams();

  for (const param of _ClerkQueryParams) {
    const value = currentSearchParams.get(param);
    if (value) {
      newParams.set(param, value);
    }
  }

  return newParams;
}
