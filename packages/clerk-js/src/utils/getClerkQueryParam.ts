const ClerkQueryParams = [
  '__clerk_status',
  '__clerk_created_session',
  '__clerk_invitation_token',
] as const;

type ClerkQueryParam = typeof ClerkQueryParams[number];

type ClerkQueryParamsToValuesMap = {
  __clerk_status: VerificationStatus;
  __clerk_created_session: string;
  __clerk_invitation_token: string;
};

export type VerificationStatus =
  | 'expired'
  | 'failed'
  | 'loading'
  | 'verified'
  | 'verified_switch_tab';

export function getClerkQueryParam<T extends ClerkQueryParam>(
  param: T,
): ClerkQueryParamsToValuesMap[T] | null {
  const val = new URL(window.location.href).searchParams.get(param);
  return val ? (val as ClerkQueryParamsToValuesMap[T]) : null;
}
