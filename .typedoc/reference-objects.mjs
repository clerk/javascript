// @ts-check
/**
 * Shared between the markdown theme and extract-methods.mjs.
 * `page.url` values are relative to TypeDoc `out` (e.g. `.typedoc/temp-docs`).
 */

/**
 * Reference object page: MDX path → TypeDoc symbol + optional source hint.
 *
 * Keys **must** match `custom-router.mjs` (`ClerkRouter`): for each symbol, `shared/<kebab(symbol)>/<kebab(symbol)>.mdx`
 * (e.g. `SessionResource` → `shared/session-resource/session-resource.mdx`). If the path drifts, TypeDoc writes one folder while `extract-methods.mjs` strips/writes under another.
 *
 * `declarationHint` is a substring of `packages/shared/src/**` file paths (used by `findInterfaceOrClass()` in `extract-methods.mjs` when multiple reflections share the same interface/class name).
 *
 * `extract-methods.mjs` reads each file, writes `properties.mdx` with the same Properties table as TypeDoc (no `## Properties` heading), strips Properties from `<object>.mdx`, and writes methods under `methods/`.
 *
 * Optional **`extraMethodInterfaces`**: extra `interface` / `class` declarations whose callable members (and `@extractMethods` namespaces) are emitted into the same `methods/` folder. Use when the documented resource type and the API surface live on different types (e.g. `APIKeyResource` vs `APIKeysNamespace` on `Clerk.apiKeys`).
 */
export const REFERENCE_OBJECT_CONFIG = {
  'shared/clerk/clerk.mdx': {
    symbol: 'Clerk',
    declarationHint: 'types/clerk',
  },
  'shared/client-resource/client-resource.mdx': {
    symbol: 'ClientResource',
    declarationHint: 'types/client',
  },
  'shared/session-resource/session-resource.mdx': {
    symbol: 'SessionResource',
    declarationHint: 'types/session',
  },
  'shared/user-resource/user-resource.mdx': {
    symbol: 'UserResource',
    declarationHint: 'types/user',
  },
  'shared/sign-in-future-resource/sign-in-future-resource.mdx': {
    symbol: 'SignInFutureResource',
    declarationHint: 'types/signInFuture',
  },
  'shared/sign-up-future-resource/sign-up-future-resource.mdx': {
    symbol: 'SignUpFutureResource',
    declarationHint: 'types/signUpFuture',
  },
  'shared/organization-resource/organization-resource.mdx': {
    symbol: 'OrganizationResource',
    declarationHint: 'types/organization',
  },
  'shared/api-key-resource/api-key-resource.mdx': {
    symbol: 'APIKeyResource',
    declarationHint: 'types/apiKeys',
    extraMethodInterfaces: [{ symbol: 'APIKeysNamespace', declarationHint: 'types/apiKeys' }],
  },
};

/** Stable iteration order matches key order in {@link REFERENCE_OBJECT_CONFIG}. */
export const REFERENCE_OBJECTS_LIST = Object.keys(REFERENCE_OBJECT_CONFIG);

/**
 * Primary interface/class documented on each reference object page (used to resolve TypeDoc reflections).
 * Derived from {@link REFERENCE_OBJECT_CONFIG}; kept for callers that only need `pageUrl → symbol`.
 */
export const REFERENCE_OBJECT_PAGE_SYMBOLS = Object.fromEntries(
  Object.entries(REFERENCE_OBJECT_CONFIG).map(([url, { symbol }]) => [url, symbol]),
);
