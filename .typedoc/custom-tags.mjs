/**
 * The custom JSDoc tags our Typedoc tooling defines, in Typedoc form (leading `@`).
 *
 * `typedoc.config.mjs` registers these with Typedoc, and `eslint.config.mjs` derives
 * `jsdoc/check-tag-names`'s `definedTags` from them, so adding a tag here keeps the docs
 * tooling and the linter in sync.
 */

export const CUSTOM_BLOCK_TAGS = [
  '@unionReturnHeadings',
  '@displayFunctionSignature',
  '@paramExtension',
  '@experimental',
  '@hideReturns',
];

export const CUSTOM_MODIFIER_TAGS = [
  /** Suppresses the Parameters table in `.typedoc/extract-methods.mjs` method MDX. */
  '@skipParametersSection',
  /**
   * On a reference-object property whose value is an inline object type: omit the parent from the main Properties table;
   * extract each callable member as `methods/<parent>-<child>.mdx` and each non-callable object member as a nested heading + property table (see `.typedoc/extract-methods.mjs`).
   */
  '@extractMethods',
  /** Type-only / router hints; not user-facing prose (see `notRenderedTags` in `typedoc.config.mjs`). */
  '@inline',
  '@inlineType',
  /** With `@inline`, still emit a standalone `.mdx` page (see `.typedoc/standalone-page-tag.mjs`). */
  '@standalonePage',
  /** Self-documenting placeholder for declarations intentionally left without a description. */
  '@generateWithEmptyComment',
  /**
   * On a generic wrapper type (e.g. `ClerkPaginationRequest<T>`), opts every alias of the form `Foo<{...}>` into a single merged properties table that includes the wrapper's own properties. Without this, typedoc-plugin-markdown renders such aliases as empty pages because the resolved type is a ReferenceType with no inline declaration.
   * Handled by `.typedoc/custom-plugin.mjs`.
   */
  '@expandProperties',
];
