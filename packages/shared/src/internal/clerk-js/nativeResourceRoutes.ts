/** Resource lookup contract shared by native invocation and Swift binding generation. */
export const nativeResourceRoutes = {
  HeadlessBrowserClerk: { kind: 'clerk' },
  SignInResource: { kind: 'signIn' },
  SignUpResource: { kind: 'signUp' },
  UserResource: { kind: 'user' },
  SessionResource: { kind: 'session' },
  OrganizationResource: { kind: 'organization' },
  BillingNamespace: { kind: 'billing' },
  EmailAddressResource: { kind: 'userResource', collection: 'emailAddresses' },
  PhoneNumberResource: { kind: 'userResource', collection: 'phoneNumbers' },
  PasskeyResource: { kind: 'userResource', collection: 'passkeys' },
  ExternalAccountResource: { kind: 'userResource', collection: 'externalAccounts' },
  Web3WalletResource: { kind: 'userResource', collection: 'web3Wallets' },
  EnterpriseAccountResource: { kind: 'userResource', collection: 'enterpriseAccounts' },
  UserOrganizationInvitationResource: { kind: 'listed', listedKind: 'userOrganizationInvitation' },
  OrganizationSuggestionResource: { kind: 'listed', listedKind: 'organizationSuggestion' },
  OrganizationInvitationResource: { kind: 'listed', listedKind: 'organizationInvitation' },
  OrganizationMembershipResource: { kind: 'listed', listedKind: 'organizationMembership' },
  OrganizationMembershipRequestResource: { kind: 'listed', listedKind: 'organizationMembershipRequest' },
  OrganizationDomainResource: { kind: 'listed', listedKind: 'organizationDomain' },
  BillingPaymentMethodResource: { kind: 'listed', listedKind: 'billingPaymentMethod' },
  BillingCheckoutResource: { kind: 'listed', listedKind: 'billingCheckout' },
  BillingSubscriptionItemResource: { kind: 'listed', listedKind: 'billingSubscriptionItem' },
  SessionWithActivitiesResource: { kind: 'listed', listedKind: 'sessionWithActivities' },
} as const;

export type NativeResourceRoute = (typeof nativeResourceRoutes)[keyof typeof nativeResourceRoutes];
export type NativeUserCollection = Extract<NativeResourceRoute, { kind: 'userResource' }>['collection'];
export type NativeListedKind = Extract<NativeResourceRoute, { kind: 'listed' }>['listedKind'];
export type NativeRetainedResource = {
  [Name in keyof typeof nativeResourceRoutes]: (typeof nativeResourceRoutes)[Name]['kind'] extends
    | 'listed'
    | 'organization'
    ? Name
    : never;
}[keyof typeof nativeResourceRoutes];

export const nativeUserCollections = Object.values(nativeResourceRoutes)
  .filter(route => route.kind === 'userResource')
  .map(route => route.collection);

export const nativeListedKinds = Object.values(nativeResourceRoutes)
  .filter(route => route.kind === 'listed')
  .map(route => route.listedKind);

/** Callable interfaces without a separate ID-addressable native resource. */
export const nativeResourceExclusions = {
  ActiveSessionResource: 'SessionResource refinement; resolved through the session route.',
  PendingSessionResource: 'SessionResource refinement; resolved through the session route.',
  SignedInSessionResource: 'SessionResource refinement; resolved through the session route.',
  SignInFutureResource: 'Signal-based auth facade; native auth uses SignInResource.',
  SignUpFutureResource: 'Signal-based auth facade; native auth uses SignUpResource.',
  CheckoutFlowResource: 'Signal-based checkout controller without a resource ID; use BillingNamespace operations.',
  VerificationResource: 'Local derived verification predicate; no independently addressable operation.',
  PasskeyVerificationResource: 'VerificationResource refinement; no independently addressable operation.',
  SignUpVerificationResource: 'VerificationResource refinement; no independently addressable operation.',
  TokenResource: 'Local token accessor; native token requests use SessionResource.getToken.',
  ClientResource: 'Lifecycle owner; native lifecycle and auth commands operate through Clerk.',
  EnvironmentResource: 'Lifecycle configuration and browser host predicates; not a native command receiver.',
  DevToolsResource: 'Development environment mutation; not part of the native resource API.',
  WaitlistResource: 'Browser waitlist entry flow; not exposed by the native API.',
} as const;
