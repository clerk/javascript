// Keys for `useOrganizationList`
const USER_MEMBERSHIPS_KEY = 'userMemberships';
const USER_INVITATIONS_KEY = 'userInvitations';
const USER_SUGGESTIONS_KEY = 'userSuggestions';

// Keys for `useOrganization`
const DOMAINS_KEY = 'domains';
const MEMBERSHIP_REQUESTS_KEY = 'membershipRequests';
const MEMBERSHIPS_KEY = 'memberships';
const INVITATIONS_KEY = 'invitations';

// Keys for `useAPIKeys`
const API_KEYS_KEY = 'apiKeys';

// Keys for `usePlans`
const PLANS_KEY = 'plans';

// Keys for `useSubscription`
const SUBSCRIPTION_KEY = 'commerce-subscription';

// Keys for `usePaymentMethods`
const PAYMENT_METHODS_KEY = 'commerce-payment-methods';

// Keys for `usePaymentAttempts`
const PAYMENT_ATTEMPTS_KEY = 'billing-payment-attempts';

// Keys for `useStatements`
const STATEMENTS_KEY = 'billing-statements';

export const STABLE_KEYS = {
  // Keys for `useOrganizationList`
  USER_MEMBERSHIPS_KEY,
  USER_INVITATIONS_KEY,
  USER_SUGGESTIONS_KEY,

  // Keys for `useOrganization`
  DOMAINS_KEY,
  MEMBERSHIP_REQUESTS_KEY,
  MEMBERSHIPS_KEY,
  INVITATIONS_KEY,

  // Keys for billing
  PLANS_KEY,
  SUBSCRIPTION_KEY,
  PAYMENT_METHODS_KEY,
  PAYMENT_ATTEMPTS_KEY,
  STATEMENTS_KEY,

  // Keys for `useAPIKeys`
  API_KEYS_KEY,
} as const;

export type ResourceCacheStableKey = (typeof STABLE_KEYS)[keyof typeof STABLE_KEYS];

type MinimalQueryClient = {
  invalidateQueries: (options: { predicate: (query: { queryKey: readonly unknown[] }) => boolean }) => Promise<void>;
};

export const safeInvalidateStableKeys = <T extends MinimalQueryClient>(
  queryClient: T | undefined,
  stableKeys: ResourceCacheStableKey[],
) => {
  return queryClient?.invalidateQueries?.({
    predicate: query => {
      const [stableKey] = query.queryKey;
      if (typeof stableKey !== 'string') {
        return false;
      }
      return stableKeys.some(key => stableKey.startsWith(key));
    },
  });
};
