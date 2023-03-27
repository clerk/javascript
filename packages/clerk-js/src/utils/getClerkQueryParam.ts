import { CLERK_SYNCED, CLERK_SYNCING } from '../core/constants';

const ClerkQueryParams = [
  '__clerk_status',
  '__clerk_created_session',
  '__clerk_invitation_token',
  '__clerk_ticket',
  '__clerk_modal_state',
  CLERK_SYNCED,
  CLERK_SYNCING,
] as const;

type ClerkQueryParam = typeof ClerkQueryParams[number];

type ClerkQueryParamsToValuesMap = {
  __clerk_status: VerificationStatus;
  __clerk_created_session: string;
  __clerk_invitation_token: string;
  __clerk_ticket: string;
  __clerk_modal_state: string;
  __clerk_synced: string;
  __clerk_syncing: string;
};

export type VerificationStatus = 'expired' | 'failed' | 'loading' | 'verified' | 'verified_switch_tab';

export function getClerkQueryParam<T extends ClerkQueryParam>(param: T): ClerkQueryParamsToValuesMap[T] | null {
  const val = new URL(window.location.href).searchParams.get(param);
  return val ? (val as ClerkQueryParamsToValuesMap[T]) : null;
}

export function removeClerkQueryParam<T extends ClerkQueryParam>(param: T) {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState(null, '', url);
  return;
}
