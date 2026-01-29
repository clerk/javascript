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

// Keys for `useOrganizationCreationDefaults`
const ORGANIZATION_CREATION_DEFAULTS_KEY = 'organizationCreationDefaults';

// Keys for `usePlans`
const PLANS_KEY = 'billing-plans';

// Keys for `useSubscription`
const SUBSCRIPTION_KEY = 'billing-subscription';

// Keys for `usePaymentMethods`
const PAYMENT_METHODS_KEY = 'billing-payment-methods';

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

  // Keys for `useOrganizationCreationDefaults`
  ORGANIZATION_CREATION_DEFAULTS_KEY,
} as const;

export type ResourceCacheStableKey = (typeof STABLE_KEYS)[keyof typeof STABLE_KEYS];

/**
 * Internal stable keys for queries only used by our UI components.
 * These keys are not used by the hooks themselves.
 */

const PAYMENT_ATTEMPT_KEY = 'billing-payment-attempt';
const BILLING_PLANS_KEY = 'billing-plan';
const BILLING_STATEMENTS_KEY = 'billing-statement';
export const INTERNAL_STABLE_KEYS = {
  PAYMENT_ATTEMPT_KEY,
  BILLING_PLANS_KEY,
  BILLING_STATEMENTS_KEY,
} as const;

export type __internal_ResourceCacheStableKey = (typeof INTERNAL_STABLE_KEYS)[keyof typeof INTERNAL_STABLE_KEYS];
