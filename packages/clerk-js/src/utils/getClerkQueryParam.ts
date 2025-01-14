import { CLERK_REDIRECT_URL, CLERK_SATELLITE_URL, CLERK_SUFFIXED_COOKIES, CLERK_SYNCED } from '../core/constants';

const ClerkQueryParams = [
  '__clerk_status',
  '__clerk_created_session',
  '__clerk_invitation_token',
  '__clerk_ticket',
  '__clerk_modal_state',
  '__clerk_handshake',
  '__clerk_help',
  CLERK_SYNCED,
  CLERK_SATELLITE_URL,
  CLERK_REDIRECT_URL,
  CLERK_SUFFIXED_COOKIES,
] as const;

type ClerkQueryParam = (typeof ClerkQueryParams)[number];

type ClerkQueryParamsToValuesMap = {
  __clerk_status: VerificationStatus | TicketStatus;
} & Record<(typeof ClerkQueryParams)[number], string>;

export type VerificationStatus =
  | 'expired'
  | 'failed'
  | 'loading'
  | 'verified'
  | 'verified_switch_tab'
  | 'client_mismatch';

type TicketStatus = 'sign_in' | 'sign_up';

export function getClerkQueryParam<T extends ClerkQueryParam>(param: T): ClerkQueryParamsToValuesMap[T] | null {
  const val = new URL(window.location.href).searchParams.get(param);
  return val ? (val as ClerkQueryParamsToValuesMap[T]) : null;
}

export function removeClerkQueryParam<T extends ClerkQueryParam>(param: T) {
  const url = new URL(window.location.href);
  if (url.searchParams.has(param)) {
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, '', url);
  }
  return;
}
