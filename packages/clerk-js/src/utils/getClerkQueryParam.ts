import { CLERK_REFERRER_PRIMARY, CLERK_SATELLITE_URL, CLERK_SYNCED } from '../core/constants';

const ClerkQueryParams = [
  '__clerk_status',
  '__clerk_created_session',
  '__clerk_invitation_token',
  '__clerk_ticket',
  '__clerk_modal_state',
  CLERK_SYNCED,
  CLERK_SATELLITE_URL,
  CLERK_REFERRER_PRIMARY,
] as const;

type ClerkQueryParam = (typeof ClerkQueryParams)[number];

type ClerkQueryParamsToValuesMap = {
  __clerk_status: VerificationStatus;
  __clerk_created_session: string;
  __clerk_invitation_token: string;
  __clerk_ticket: string;
  __clerk_modal_state: string;
  __clerk_synced: string;
  __clerk_satellite_url: string;
  __clerk_referrer_primary: string;
};

export type VerificationStatus = 'expired' | 'failed' | 'loading' | 'verified' | 'verified_switch_tab';

export function getClerkQueryParam<T extends ClerkQueryParam>(param: T): ClerkQueryParamsToValuesMap[T] | null {
  const val = new URL(window.location.href).searchParams.get(param);
  return val ? (val as ClerkQueryParamsToValuesMap[T]) : null;
}

export function replaceClerkQueryParam<T extends ClerkQueryParam, P extends ClerkQueryParam>(
  replace: T,
  param: P,
  value: string,
) {
  const url = new URL(window.location.href);
  url.searchParams.delete(replace);
  url.searchParams.set(param, value);
  window.history.replaceState(window.history.state, '', url);
}

export function removeClerkQueryParam<T extends ClerkQueryParam>(param: T) {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState(window.history.state, '', url);
  return;
}
