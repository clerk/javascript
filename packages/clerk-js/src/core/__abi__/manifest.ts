/**
 * Cross-bundle ABI manifest for `Clerk` and `IsomorphicClerk`.
 *
 * Each entry below is a runtime `__internal_*` member that is read or written
 * by an independently-shipped npm package (e.g. `@clerk/shared`, `@clerk/react`,
 * `@clerk/nextjs`, `@clerk/expo`, `@clerk/tanstack-react-start`). Because
 * `@clerk/clerk-js` auto-updates from the CDN underneath those pinned-on-npm
 * consumers, removing or reshaping any member here is a breaking change for
 * every still-supported consumer that calls it, even if no monorepo file does.
 *
 * Scope (intentionally narrow):
 *   - Members on the live `Clerk` instance (and `IsomorphicClerk` queue)
 *   - That are reached at runtime from outside `@clerk/clerk-js`
 *
 * Out of scope (separate manifests, separate tests):
 *   - Script-loader options (`__internal_clerkJSUrl`, `__internal_clerkJSVersion`,
 *     `__internal_clerkUIUrl`, `__internal_clerkUIVersion`)
 *   - Window-level globals (`window.__internal_onBeforeSetActive`,
 *     `window.__internal_onAfterSetActive`, `window.__internal_ClerkUICtor`)
 *   - Resource-level internals (`__internal_toSnapshot` on Resource shapes)
 *
 * Policy: see `docs/CONTRIBUTING.md` ("Cross-bundle ABI").
 * Adding an entry is always fine. Removing or reshaping an entry requires a
 * functional compat shim until the SDK compatibility matrix (separate work)
 * confirms no still-supported consumer remains.
 *
 * Sibling tests:
 *   - `clerk.abi-contract.test.ts` asserts each entry exists on a fresh
 *     `new Clerk(pk)` with the right `kind`, and pins this list via snapshot.
 *   - `clerk.abi-usage-scan.test.ts` scans consumer packages and asserts every
 *     `<clerkInstance>.__internal_X` read corresponds to an entry here.
 */

export type AbiMemberKind =
  /** ES getter on the class (`get name() { ... }`). Read-only. */
  | 'getter'
  /** Bound method or arrow function. `typeof inst[name] === 'function'`. */
  | 'method'
  /** Plain property with a default value baked in. */
  | 'property'
  /** Property declared as `T | undefined`, intentionally written by SDKs. */
  | 'assignable-slot';

export type AbiMember = {
  /** Member name on the `Clerk` instance. */
  readonly name: string;
  /** How the member is declared on `Clerk`; drives contract-test assertion. */
  readonly kind: AbiMemberKind;
  /**
   * Consumer packages that read or write this member at runtime today.
   * Names match `packages/<dir>` not npm names.
   */
  readonly consumers: readonly string[];
  /**
   * Published package versions that still consume this member, even if current
   * main no longer does. These keep compat shims in the manifest until the
   * compatibility matrix proves they are out of the support window.
   */
  readonly historicalConsumers?: readonly {
    readonly packageName: string;
    readonly range: string;
    readonly note: string;
  }[];
  /** Free-form context (e.g. "restored by #8562 as backward-compat shim"). */
  readonly note?: string;
};

export const ABI_MEMBERS = [
  // ── Core state and options ─────────────────────────────────────────────
  {
    name: '__internal_state',
    kind: 'property',
    consumers: ['react', 'shared'],
  },
  {
    name: '__internal_country',
    kind: 'property',
    consumers: ['ui'],
  },
  {
    name: '__internal_getOption',
    kind: 'method',
    consumers: ['react', 'shared', 'ui'],
  },
  {
    name: '__internal_lastEmittedResources',
    kind: 'property',
    consumers: ['react', 'shared', 'ui'],
  },
  {
    name: '__internal_environment',
    kind: 'getter',
    consumers: ['react', 'shared', 'expo'],
  },
  {
    name: '__internal_setActiveInProgress',
    kind: 'property',
    consumers: ['ui'],
  },

  // ── Modal open/close (consumed by @clerk/react through IsomorphicClerk) ─
  {
    name: '__internal_openCheckout',
    kind: 'method',
    consumers: ['astro', 'react', 'ui'],
  },
  {
    name: '__internal_closeCheckout',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_openPlanDetails',
    kind: 'method',
    consumers: ['astro', 'react', 'ui'],
  },
  {
    name: '__internal_closePlanDetails',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_openSubscriptionDetails',
    kind: 'method',
    consumers: ['astro', 'react', 'ui'],
  },
  {
    name: '__internal_closeSubscriptionDetails',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_openReverification',
    kind: 'method',
    consumers: ['react', 'shared'],
  },
  {
    name: '__internal_closeReverification',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_openEnableOrganizationsPrompt',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_closeEnableOrganizationsPrompt',
    kind: 'method',
    consumers: ['react', 'ui'],
  },
  {
    name: '__internal_mountOAuthConsent',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_unmountOAuthConsent',
    kind: 'method',
    consumers: ['react'],
  },

  // ── Modal-adjacent helpers ─────────────────────────────────────────────
  {
    name: '__internal_attemptToEnableEnvironmentSetting',
    kind: 'method',
    consumers: ['react', 'shared'],
  },
  {
    name: '__internal_loadStripeJs',
    kind: 'method',
    consumers: ['react', 'shared'],
  },
  {
    name: '__internal_setEnvironment',
    kind: 'method',
    consumers: ['react'],
  },
  {
    name: '__internal_updateProps',
    kind: 'method',
    consumers: ['astro', 'react', 'vue'],
  },

  // ── Navigation ─────────────────────────────────────────────────────────
  {
    name: '__internal_addNavigationListener',
    kind: 'method',
    consumers: ['ui'],
  },
  {
    name: '__internal_navigateWithError',
    kind: 'method',
    consumers: ['ui'],
  },

  // ── Cached / initial resources (read AND written by SDKs) ──────────────
  {
    name: '__internal_getCachedResources',
    kind: 'assignable-slot',
    consumers: ['expo'],
    note: 'expo assigns this so non-standard browsers can fall back to cached initial resources.',
  },
  {
    name: '__internal_reloadInitialResources',
    kind: 'method',
    consumers: ['expo'],
  },

  // ── FAPI hook installation (expo) ──────────────────────────────────────
  {
    name: '__internal_onBeforeRequest',
    kind: 'method',
    consumers: ['chrome-extension', 'expo'],
  },
  {
    name: '__internal_onAfterResponse',
    kind: 'method',
    consumers: ['chrome-extension', 'expo'],
  },

  // ── WebAuthn extension slots (expo assigns these at boot) ──────────────
  {
    name: '__internal_createPublicCredentials',
    kind: 'assignable-slot',
    consumers: ['expo'],
  },
  {
    name: '__internal_getPublicCredentials',
    kind: 'assignable-slot',
    consumers: ['expo'],
  },
  {
    name: '__internal_isWebAuthnSupported',
    kind: 'assignable-slot',
    consumers: ['expo', 'ui'],
  },
  {
    name: '__internal_isWebAuthnAutofillSupported',
    kind: 'assignable-slot',
    consumers: ['expo'],
  },
  {
    name: '__internal_isWebAuthnPlatformAuthenticatorSupported',
    kind: 'assignable-slot',
    consumers: ['expo'],
  },

  // ── Backward-compat shims (added in response to incidents) ─────────────
  {
    name: '__internal_queryClient',
    kind: 'getter',
    consumers: [],
    historicalConsumers: [
      {
        packageName: '@clerk/shared',
        range: '<4.10.0',
        note: '@clerk/shared < 4.10.0 reads this to bootstrap its TanStack QueryClient.',
      },
    ],
    note:
      'Restored in #8562 after #8434 removed it; @clerk/shared < 4.10.0 reads this to bootstrap its TanStack QueryClient. Removable only when the compatibility matrix confirms no in-window shared version still reads it.',
  },
] as const satisfies readonly AbiMember[];

/** Index by name for O(1) lookup in tests. */
export const ABI_MEMBERS_BY_NAME: Readonly<Record<string, AbiMember>> = Object.freeze(
  Object.fromEntries(ABI_MEMBERS.map(m => [m.name, m])),
);
