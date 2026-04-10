// @ts-check
/**
 * Shared between the markdown theme and extract-methods.mjs.
 * `page.url` values are relative to TypeDoc `out` (e.g. `.typedoc/temp-docs`).
 */

export const REFERENCE_OBJECTS_LIST = ['shared/clerk.mdx', 'shared/client-resource.mdx'];

/**
 * Primary interface/class documented on each reference object page (used to resolve TypeDoc reflections).
 */
export const REFERENCE_OBJECT_PAGE_SYMBOLS = {
  'shared/clerk.mdx': 'Clerk',
  'shared/client-resource.mdx': 'ClientResource',
};
