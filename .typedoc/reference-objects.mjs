// @ts-check
/**
 * Shared between the markdown theme and extract-methods.mjs.
 * `page.url` values are relative to TypeDoc `out` (e.g. `.typedoc/temp-docs`).
 */

/**
 * Reference object page: MDX path → TypeDoc symbol + optional source hint.
 *
 * `declarationHint` is a substring of `packages/shared/src/**` file paths (used by `findInterfaceOrClass()` in `extract-methods.mjs` when multiple reflections share the same interface/class name).
 *
 * `extract-methods.mjs` reads each file, writes `properties.mdx` with the same Properties table as TypeDoc, strips Properties from `<object>.mdx`, and writes methods under `methods/`.
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
  'shared/session/session.mdx': {
    symbol: 'SessionResource',
    declarationHint: 'types/session',
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
