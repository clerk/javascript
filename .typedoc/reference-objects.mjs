// @ts-check
/**
 * Shared between the markdown theme and extract-methods.mjs.
 * `page.url` values are relative to TypeDoc `out` (e.g. `.typedoc/temp-docs`).
 */

/**
 * TypeDoc output paths for the main reference pages (`shared/<object>/<object>.mdx`, see `ClerkRouter`).
 * `extract-methods.mjs` reads each file, writes `<object>-properties.mdx` with the same Properties table as TypeDoc, strips Properties from `<object>.mdx`, and writes methods under `<object>-methods/`.
 */
export const REFERENCE_OBJECTS_LIST = ['shared/clerk/clerk.mdx', 'shared/client-resource/client-resource.mdx'];

/**
 * Primary interface/class documented on each reference object page (used to resolve TypeDoc reflections).
 * keys = stable MDX paths under .typedoc output
 * values = which TypeDoc declaration to treat as that page’s “main” type for routing and per-method extraction.
 */
export const REFERENCE_OBJECT_PAGE_SYMBOLS = {
  'shared/clerk/clerk.mdx': 'Clerk',
  'shared/client-resource/client-resource.mdx': 'ClientResource',
};
